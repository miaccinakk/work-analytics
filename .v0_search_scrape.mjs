import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"

const QUERY = "интернет-маркетолог"
const TOTAL_PAGES = 20 // hh caps at ~2000 results

function ab(args) {
  return execFileSync("agent-browser", args, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 })
}
function parseEval(raw) {
  const lines = String(raw).split("\n").map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return []
  let s = lines[lines.length - 1]
  for (let i = 0; i < 3; i++) {
    if (typeof s === "string" && s.startsWith('"')) { try { s = JSON.parse(s); continue } catch {} }
    break
  }
  try { return typeof s === "string" ? JSON.parse(s) : s } catch { return [] }
}

// Extract title, link, employer name + link, salary directly from SERP card
const EXTRACT = `(() => {
  const cards = [...document.querySelectorAll('[data-qa="vacancy-serp__vacancy"], [data-qa="serp-item"]')];
  const out = [];
  for (const c of cards) {
    const a = c.querySelector('a[data-qa="serp-item__title"], a[data-qa="vacancy-serp__vacancy-title"]');
    if (!a) continue;
    const h = a.href.split('?')[0];
    const m = h.match(/vacancy\\/(\\d+)/);
    if (!m) continue;
    const emp = c.querySelector('a[data-qa="vacancy-serp__vacancy-employer"]');
    const sal = c.querySelector('[data-qa="vacancy-serp__vacancy-compensation"]');
    out.push({
      id: m[1],
      t: a.innerText.trim(),
      h,
      emp: emp ? emp.innerText.trim() : "",
      empH: emp ? emp.href.split('?')[0] : "",
      sal: sal ? sal.innerText.replace(/\\s+/g,' ').trim() : ""
    });
  }
  return JSON.stringify(out);
})()`

const all = new Map()
for (let p = 0; p < TOTAL_PAGES; p++) {
  const url = `https://hh.ru/search/vacancy?text=${encodeURIComponent(QUERY)}&items_on_page=100&page=${p}`
  try {
    ab(["open", url])
    execFileSync("sleep", ["2.2"])
    const items = parseEval(ab(["eval", EXTRACT]))
    let added = 0
    for (const it of items) { if (!all.has(it.id)) { all.set(it.id, it); added++ } }
    console.log(`page ${p}: got ${items.length}, new ${added}, total ${all.size}`)
    if (items.length === 0) break
  } catch (err) {
    console.log(`page ${p}: ERROR ${String(err).slice(0, 100)}`)
  }
}

const arr = [...all.values()]
writeFileSync("./.v0_search_raw.json", JSON.stringify(arr, null, 0))
console.log("saved .v0_search_raw.json total:", arr.length)
