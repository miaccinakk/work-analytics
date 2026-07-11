const fs = require("fs")

function parseMaybe(x) {
  if (typeof x === "string") {
    try { return JSON.parse(x) } catch (e) { return null }
  }
  return x
}

// base list from MD-derived file
const base = require("./.v0_vac.json")

// vacancy pages: brief, salary, empLink
const vpages = {}
fs.readFileSync(".v0_vpages.jsonl", "utf8").trim().split("\n").forEach((l) => {
  const o = JSON.parse(l)
  vpages[o.id] = parseMaybe(o.d) || {}
})

// employer pages keyed by employer id
const epages = {}
fs.readFileSync(".v0_epages.jsonl", "utf8").trim().split("\n").forEach((l) => {
  const o = JSON.parse(l)
  epages[o.eid] = parseMaybe(o.e) || {}
})

function empIdFromLink(link) {
  if (!link) return null
  const m = link.match(/employer\/(\d+)/)
  return m ? m[1] : null
}

const merged = base.map((v) => {
  const vp = vpages[v.id] || {}
  const eid = empIdFromLink(vp.empLink)
  const ep = eid ? epages[eid] || {} : {}
  return {
    id: v.id,
    cat: v.cat,
    title: vp.title || v.title,
    employer: (ep.name || v.employer || "").trim(),
    salary: vp.salary || v.salary || "",
    loc: vp.loc || v.loc || "",
    brief: (vp.brief || "").replace(/\s+/g, " ").trim(),
    vacLink: "https://hh.ru/vacancy/" + v.id,
    empLink: vp.empLink || (eid ? "https://hh.ru/employer/" + eid : ""),
    site: ep.site || "",
    socials: ep.social || ep.socials || [],
    weakWeb: !!v.weakWeb,
  }
})

fs.writeFileSync(".v0_merged.json", JSON.stringify(merged, null, 0))

const byCat = {}
merged.forEach((m) => { byCat[m.cat] = (byCat[m.cat] || 0) + 1 })
const withSite = merged.filter((m) => m.site).length
const withSocial = merged.filter((m) => m.socials.length).length
const withBrief = merged.filter((m) => m.brief).length
console.log("total:", merged.length, "| byCat:", JSON.stringify(byCat))
console.log("withSite:", withSite, "| withSocial:", withSocial, "| withBrief:", withBrief)
