import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"

let list = JSON.parse(readFileSync("./.v0_relevant_new.json", "utf8"))

// drop obvious non-fit (speaker/lecture) that slipped through, dedupe by title+employer
list = list.filter((v) => !/спикер|лекци/i.test(v.title))
const seen = new Set()
list = list.filter((v) => {
  const k = (v.title.toLowerCase().trim() + "|" + v.employer.toLowerCase().trim())
  if (seen.has(k)) return false
  seen.add(k)
  return true
})
console.log("to enrich:", list.length)

const VPAGE = readFileSync("./.v0_vpage.js", "utf8")
const EPAGE = readFileSync("./.v0_epage.js", "utf8")

function ab(args, wait = 0) {
  const out = execFileSync("agent-browser", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 })
  if (wait) execFileSync("sleep", [String(wait)])
  return out
}
function parseEval(raw) {
  const lines = String(raw).split("\n").map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return null
  let s = lines[lines.length - 1]
  for (let i = 0; i < 3; i++) {
    if (typeof s === "string" && s.startsWith('"')) { try { s = JSON.parse(s); continue } catch {} }
    break
  }
  try { return typeof s === "string" ? JSON.parse(s) : s } catch { return null }
}

const empCache = {}
const results = []

for (let i = 0; i < list.length; i++) {
  const v = list[i]
  try {
    ab(["open", v.vacLink], 2.5)
    const vp = parseEval(ab(["eval", VPAGE])) || {}
    let empLink = vp.empLink || `https://hh.ru/employer/${v.empId}`
    const empId = (empLink.match(/employer\/(\d+)/) || [])[1] || v.empId

    if (!empCache[empId]) {
      try {
        ab(["open", empLink.split("?")[0]], 2)
        empCache[empId] = parseEval(ab(["eval", EPAGE])) || {}
      } catch { empCache[empId] = {} }
    }
    const ep = empCache[empId]

    results.push({
      id: v.id,
      cat: v.cat,
      title: v.title,
      employer: ep.name || v.employer,
      salary: vp.salary || "Не указана",
      loc: "",
      brief: vp.brief || ep.desc || "",
      vacLink: v.vacLink,
      empLink: `https://hh.ru/employer/${empId}?hhtmFrom=vacancy`,
      site: ep.site || "",
      socials: ep.social || [],
      weakWeb: !ep.site && (ep.social || []).length > 0,
    })
    console.log(`[${i + 1}/${list.length}] OK ${v.title.slice(0, 40)} | ${vp.salary || "—"} | site:${ep.site || "нет"}`)
  } catch (err) {
    console.log(`[${i + 1}/${list.length}] ERR ${v.title.slice(0, 40)} ${String(err).slice(0, 80)}`)
    results.push({ id: v.id, cat: v.cat, title: v.title, employer: v.employer, salary: "Не указана", loc: "", brief: "", vacLink: v.vacLink, empLink: `https://hh.ru/employer/${v.empId}?hhtmFrom=vacancy`, site: "", socials: [], weakWeb: false })
  }
}

writeFileSync("./.v0_new_enriched.json", JSON.stringify(results, null, 0))
console.log("saved .v0_new_enriched.json:", results.length)
