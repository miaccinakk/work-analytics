import fs from "fs";

const DATA = "lib/vacancies-data.ts";
const ENRICHED = ".v0_search_enriched.json";

const src = fs.readFileSync(DATA, "utf8");
const eq = src.indexOf("= [");
const start = src.indexOf("[", eq);
const end = src.lastIndexOf("]");
const header = src.slice(0, start);
const arr = JSON.parse(src.slice(start, end + 1));

const existing = new Set(arr.map((v) => v.id));
const enriched = JSON.parse(fs.readFileSync(ENRICHED, "utf8"));

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

let added = 0;
for (const v of enriched) {
  if (!v.id || existing.has(v.id)) continue;
  // skip entries with no title
  const title = clean(v.title);
  if (!title) continue;
  existing.add(v.id);
  arr.push({
    id: v.id,
    cat: v.cat || "mkt",
    title,
    employer: clean(v.employer),
    salary: clean(v.salary) || "Не указана",
    loc: clean(v.loc),
    brief: clean(v.brief),
    vacLink: v.vacLink || `https://hh.ru/vacancy/${v.id}`,
    empLink: v.empLink || "",
    site: v.site || "",
    socials: Array.isArray(v.socials) ? v.socials : [],
    weakWeb: !!v.weakWeb,
  });
  added++;
}

const body = arr.map((v) => "  " + JSON.stringify(v)).join(",\n");
fs.writeFileSync(DATA, header + "[\n" + body + "\n]\n");
console.log("added:", added, "| total now:", arr.length);
