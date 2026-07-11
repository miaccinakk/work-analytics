import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"

// Поверхностный сбор по startup/MVP: только выдача hh, без захода внутрь вакансий.
const QUERIES = ["startup", "стартап", "mvp", "mvp разработка"]
const PAGES_PER_QUERY = 3

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
    const addr = c.querySelector('[data-qa="vacancy-serp__vacancy-address"]');
    out.push({
      id: m[1],
      title: a.innerText.trim(),
      vacLink: h,
      employer: emp ? emp.innerText.trim() : "",
      empLink: emp ? emp.href.split('?')[0] : "",
      salary: sal ? sal.innerText.replace(/\\s+/g,' ').trim() : "",
      loc: addr ? addr.innerText.replace(/\\s+/g,' ').trim() : ""
    });
  }
  return JSON.stringify(out);
})()`

// Оставляем только разработку и маркетинг (+ смежное: SEO, сайты, интернет-маркетинг).
const KEEP = [
  // разработка
  "разработчик", "developer", "frontend", "фронтенд", "фронт", "react", "reactjs",
  "vue", "nuxt", "fullstack", "full-stack", "фулстек", "backend", "бэкенд", "node",
  "javascript", "typescript", "верстальщик", "верстка", "веб", "web", "программист",
  "сайт", "лендинг", "landing", "tilda", "тильда", "cto", "техлид", "tech lead", "mvp",
  // маркетинг / интернет-маркетинг
  "маркетолог", "маркетинг", "marketing", "seo", "трафик", "таргетолог", "таргет",
  "директолог", "контекст", "smm", "growth", "продвижение", "cmo", "digital",
]
const DROP = [
  "1с", "1c", "битрикс", "bitrix", "php", "python", "java ", "c++", "c#", ".net",
  "android", "ios", "qa", "тестировщик", "аналитик", "analyst", "devops",
  "администратор", "call", "колл-центр", "оператор", "курьер", "продавец",
  "менеджер по продажам", "бухгалтер", "hr", "рекрутер", "юрист", "支持",
  "поддержк", "саппорт", "support", "продаж", "sales", "закупк", "логист",
  "инвест", "трейд", "финанс", "бизнес-аналит", "data ", "дата-", "science",
]
const norm = (s) => (s || "").toLowerCase()
function isRelevant(title) {
  const t = norm(title)
  if (DROP.some((d) => t.includes(d))) return false
  return KEEP.some((k) => t.includes(k))
}

const all = new Map()
for (const q of QUERIES) {
  for (let p = 0; p < PAGES_PER_QUERY; p++) {
    const url = `https://hh.ru/search/vacancy?text=${encodeURIComponent(q)}&schedule=remote&items_on_page=100&page=${p}`
    try {
      ab(["open", url])
      execFileSync("sleep", ["2.2"])
      const items = parseEval(ab(["eval", EXTRACT]))
      let added = 0
      for (const it of items) {
        if (all.has(it.id)) continue
        if (!isRelevant(it.title)) continue
        all.set(it.id, {
          ...it,
          cat: "startup",
          brief: "",
          site: "",
          socials: [],
          weakWeb: false,
        })
        added++
      }
      console.log(`[${q}] page ${p}: got ${items.length}, kept-new ${added}, total ${all.size}`)
      if (items.length === 0) break
    } catch (err) {
      console.log(`[${q}] page ${p}: ERROR ${String(err).slice(0, 120)}`)
    }
  }
}

const arr = [...all.values()]
writeFileSync("./.v0_search_enriched.json", JSON.stringify(arr, null, 0))
console.log("saved .v0_search_enriched.json total:", arr.length)
