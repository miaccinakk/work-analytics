import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync, existsSync } from "node:fs"

const IN = "./.v0_search_kept.json"
const OUT = "./.v0_search_enriched.json"
const CACHE = "./.v0_emp_cache.json"

let list = JSON.parse(readFileSync(IN, "utf8"))

// dedupe by id (keep first)
const seenId = new Set()
list = list.filter((v) => {
  if (seenId.has(v.id)) return false
  seenId.add(v.id)
  return true
})

// resume: load already-enriched
let results = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : []
const done = new Set(results.map((r) => r.id))
let empCache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {}

const todo = list.filter((v) => !done.has(v.id))
console.log(`total ${list.length} | done ${done.size} | todo ${todo.length}`)

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
function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 0))
  writeFileSync(CACHE, JSON.stringify(empCache, null, 0))
}

for (let i = 0; i < todo.length; i++) {
  const v = todo[i]
  const empId = (v.empH && (v.empH.match(/employer\/(\d+)/) || [])[1]) || null
  try {
    ab(["open", v.h], 1.0)
    const vp = parseEval(ab(["eval", VPAGE])) || {}

    // employer site: fetch once per employer
    let ep = empId && empCache[empId] ? empCache[empId] : null
    if (!ep && empId) {
      try {
        ab(["open", `https://hh.ru/employer/${empId}`], 0.8)
        ep = parseEval(ab(["eval", EPAGE])) || {}
      } catch { ep = {} }
      empCache[empId] = ep
    }
    ep = ep || {}

    results.push({
      id: v.id,
      cat: "mkt",
      title: v.t,
      employer: v.emp || ep.name || "",
      salary: vp.salary || v.sal || "Не указана",
      loc: "",
      brief: vp.brief || "",
      vacLink: v.h,
      empLink: empId ? `https://hh.ru/employer/${empId}?hhtmFrom=vacancy` : (v.empH || ""),
      site: ep.site || "",
      socials: ep.social || [],
      weakWeb: !ep.site && (ep.social || []).length > 0,
    })
    if ((i + 1) % 10 === 0) { save(); console.log(`[${i + 1}/${todo.length}] saved. last: ${v.t.slice(0, 40)} | ${vp.salary || v.sal || "—"}`) }
  } catch (err) {
    results.push({
      id: v.id, cat: "mkt", title: v.t, employer: v.emp || "", salary: v.sal || "Не указана", loc: "",
      brief: "", vacLink: v.h, empLink: empId ? `https://hh.ru/employer/${empId}?hhtmFrom=vacancy` : (v.empH || ""),
      site: "", socials: [], weakWeb: false,
    })
    console.log(`[${i + 1}/${todo.length}] ERR ${v.t.slice(0, 40)} ${String(err).slice(0, 60)}`)
  }
}
save()
console.log(`DONE. enriched total: ${results.length}`)
