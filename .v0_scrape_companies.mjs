import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"

const merged = JSON.parse(readFileSync("./.v0_merged.json", "utf8"))

// Build unique employer map from online-school dataset
const emps = {}
for (const v of merged) {
  const m = (v.empLink || "").match(/employer\/(\d+)/)
  if (!m) continue
  const id = m[1]
  if (!emps[id]) emps[id] = { id, name: v.employer, seedTitles: [] }
  emps[id].seedTitles.push(v.title)
}
const employers = Object.values(emps)
console.log("employers to scan:", employers.length)

function ab(args) {
  return execFileSync("agent-browser", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 })
}

function parseEval(raw) {
  const lines = String(raw).split("\n").map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return []
  let s = lines[lines.length - 1]
  // unwrap JSON-encoded string possibly wrapped multiple times
  for (let i = 0; i < 3; i++) {
    if (typeof s === "string" && s.startsWith('"')) {
      try { s = JSON.parse(s); continue } catch {}
    }
    break
  }
  try { return typeof s === "string" ? JSON.parse(s) : s } catch { return [] }
}

const EXTRACT = `(() => {
  const links = [...document.querySelectorAll('a[data-qa="serp-item__title"], a[data-qa="vacancy-serp__vacancy-title"]')]
    .map(a => ({ t: a.innerText.trim(), h: a.href.split('?')[0] }))
    .filter(x => x.t && /\\/vacancy\\/(\\d+)/.test(x.h));
  const seen = new Set();
  const out = [];
  for (const l of links) { const id = l.h.match(/vacancy\\/(\\d+)/)[1]; if (seen.has(id)) continue; seen.add(id); out.push({ id, t: l.t, h: l.h }); }
  return JSON.stringify(out);
})()`

const results = []
for (let i = 0; i < employers.length; i++) {
  const e = employers[i]
  const url = `https://hh.ru/search/vacancy?from=employerPage&employer_id=${e.id}&items_on_page=100`
  try {
    ab(["open", url])
    // small wait for SERP render
    execFileSync("sleep", ["2.5"])
    const raw = ab(["eval", EXTRACT])
    let vacs = parseEval(raw)
    results.push({ id: e.id, name: e.name, seedTitles: e.seedTitles, vacs })
    console.log(`[${i + 1}/${employers.length}] ${e.name} -> ${vacs.length} vac`)
  } catch (err) {
    console.log(`[${i + 1}/${employers.length}] ${e.name} -> ERROR ${String(err).slice(0, 120)}`)
    results.push({ id: e.id, name: e.name, seedTitles: e.seedTitles, vacs: [] })
  }
}

writeFileSync("./.v0_company_vacs.json", JSON.stringify(results, null, 0))
console.log("saved .v0_company_vacs.json | total vacs:", results.reduce((a, r) => a + r.vacs.length, 0))
