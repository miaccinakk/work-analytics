const fs = require("fs")
const data = require("./.v0_merged.json")

const CAT_META = {
  mkt: { label: "Маркетинг", desc: "Точка входа под оффер по сайту" },
  dev: { label: "Разработка", desc: "Прямой стек: React / фронтенд / fullstack" },
  design: { label: "Дизайн / UI-UX", desc: "Смежные позиции" },
  big: { label: "Крупные", desc: "Большие компании — отдельно" },
}
const CAT_ORDER = ["mkt", "dev", "design", "big"]

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

const counts = {}
data.forEach((d) => { counts[d.cat] = (counts[d.cat] || 0) + 1 })

const generatedAt = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Онлайн-школы — вакансии для отклика</title>
<style>
  :root {
    --bg: #0f1115;
    --surface: #181b22;
    --surface-2: #1f2430;
    --border: #2a2f3a;
    --text: #e7e9ee;
    --muted: #9aa3b2;
    --accent: #4f9cf9;
    --accent-soft: rgba(79,156,249,0.12);
    --green: #46c08a;
    --amber: #e0a94a;
    --radius: 12px;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
  }
  header {
    padding: 32px 20px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  h1 { font-size: 26px; margin: 0 0 6px; }
  .sub { color: var(--muted); font-size: 14px; margin: 0 0 4px; }
  .offer {
    margin-top: 16px;
    padding: 14px 16px;
    background: var(--accent-soft);
    border: 1px solid rgba(79,156,249,0.3);
    border-radius: var(--radius);
    font-size: 14px;
  }
  .offer a { color: var(--accent); }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 0 20px 60px; }
  .controls {
    position: sticky; top: 0; z-index: 10;
    background: var(--bg);
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
  }
  #search {
    flex: 1 1 240px;
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 14px;
  }
  #search:focus { outline: none; border-color: var(--accent); }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    padding: 8px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--muted);
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    transition: all .15s;
  }
  .chip:hover { border-color: var(--accent); color: var(--text); }
  .chip.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); cursor: pointer; }
  .cat-block { margin-top: 34px; }
  .cat-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }
  .cat-head h2 { font-size: 19px; margin: 0; }
  .cat-head .cnt { color: var(--muted); font-size: 13px; }
  .cat-head .cdesc { color: var(--muted); font-size: 13px; margin-left: auto; }
  .grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
  @media (min-width: 720px) { .grid { grid-template-columns: 1fr 1fr; } }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .card.weak { border-color: rgba(224,169,74,0.5); }
  .card-top { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
  .vtitle { font-size: 15px; font-weight: 600; margin: 0; }
  .vtitle a { color: var(--text); text-decoration: none; }
  .vtitle a:hover { color: var(--accent); }
  .emp { color: var(--muted); font-size: 13px; }
  .badges { display: flex; flex-wrap: wrap; gap: 6px; }
  .badge { font-size: 11px; padding: 3px 8px; border-radius: 6px; background: var(--surface-2); color: var(--muted); white-space: nowrap; }
  .badge.sal { color: var(--green); }
  .badge.weak { color: var(--amber); background: rgba(224,169,74,0.12); }
  .links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
  .links a {
    font-size: 12px; padding: 5px 10px; border-radius: 8px;
    text-decoration: none; border: 1px solid var(--border);
    color: var(--text); background: var(--surface-2);
  }
  .links a:hover { border-color: var(--accent); color: var(--accent); }
  .links a.site { border-color: rgba(70,192,138,0.4); color: var(--green); }
  .links a.social { border-color: rgba(79,156,249,0.4); color: var(--accent); }
  .brief-toggle {
    margin-top: 4px; background: none; border: none; color: var(--accent);
    font-size: 13px; cursor: pointer; padding: 0; text-align: left;
  }
  .brief { display: none; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); padding-top: 10px; margin-top: 2px; white-space: pre-wrap; }
  .brief.open { display: block; }
  .empty { color: var(--muted); font-size: 14px; padding: 20px 0; }
  footer { max-width: 1100px; margin: 0 auto; padding: 20px; color: var(--muted); font-size: 12px; border-top: 1px solid var(--border); }
</style>
</head>
<body>
<header>
  <h1>Онлайн-школы — вакансии для отклика</h1>
  <p class="sub">Собрано с hh.ru · ${data.length} вакансий · обновлено ${generatedAt}</p>
  <p class="sub">Отсортировано по типу запроса. Разверни «Описание» под карточкой, чтобы прочитать бриф.</p>
  <div class="offer">
    <strong>Твоя стратегия:</strong> заходить через маркетинг/трафик и предлагать сборку сайта на React.
    Заготовка портфолио: <a href="https://courses.ctrlcat.my/" target="_blank" rel="noopener">courses.ctrlcat.my</a>.
    Карточки с меткой <span style="color:var(--amber)">слабый сайт</span> — школы, живущие на соцсетях, самые вкусные под оффер.
  </div>
</header>
<div class="wrap">
  <div class="controls">
    <input id="search" type="search" placeholder="Поиск: компания, роль, ключевое слово…">
    <div class="chips" id="chips"></div>
    <label class="toggle"><input type="checkbox" id="weakOnly"> только слабый сайт</label>
  </div>
  <div id="results"></div>
</div>
<footer>
  Данные носят справочный характер и могли устареть. Контакты hh не публикует — связь через отклик на вакансию.
</footer>

<script>
const DATA = ${JSON.stringify(data)};
const CAT_META = ${JSON.stringify(CAT_META)};
const CAT_ORDER = ${JSON.stringify(CAT_ORDER)};
const COUNTS = ${JSON.stringify(counts)};

let activeCat = "all";
let weakOnly = false;
let query = "";

const chipsEl = document.getElementById("chips");
const resultsEl = document.getElementById("results");
const searchEl = document.getElementById("search");
const weakEl = document.getElementById("weakOnly");

function esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

function buildChips(){
  const cats = [["all","Все ("+DATA.length+")"]].concat(
    CAT_ORDER.filter(c=>COUNTS[c]).map(c=>[c, CAT_META[c].label+" ("+COUNTS[c]+")"])
  );
  chipsEl.innerHTML = cats.map(([id,label])=>
    '<span class="chip'+(id===activeCat?' active':'')+'" data-cat="'+id+'">'+esc(label)+'</span>'
  ).join("");
  chipsEl.querySelectorAll(".chip").forEach(el=>{
    el.onclick=()=>{ activeCat=el.dataset.cat; buildChips(); render(); };
  });
}

function hostOf(u){ try { return new URL(u).hostname.replace(/^www\\./,""); } catch(e){ return u; } }

function cardHTML(v, idx){
  const badges = [];
  if (v.salary) badges.push('<span class="badge sal">'+esc(v.salary)+'</span>');
  if (v.loc) badges.push('<span class="badge">'+esc(v.loc)+'</span>');
  if (v.weakWeb) badges.push('<span class="badge weak">слабый сайт</span>');

  const links = [];
  links.push('<a href="'+esc(v.vacLink)+'" target="_blank" rel="noopener">Вакансия ↗</a>');
  if (v.empLink) links.push('<a href="'+esc(v.empLink)+'" target="_blank" rel="noopener">Компания ↗</a>');
  if (v.site) links.push('<a class="site" href="'+esc(v.site)+'" target="_blank" rel="noopener">'+esc(hostOf(v.site))+' ↗</a>');
  (v.socials||[]).forEach(s=> links.push('<a class="social" href="'+esc(s)+'" target="_blank" rel="noopener">'+esc(hostOf(s))+' ↗</a>'));

  const briefBtn = v.brief
    ? '<button class="brief-toggle" data-b="'+idx+'">▸ Описание вакансии</button><div class="brief" id="brief-'+idx+'">'+esc(v.brief)+'</div>'
    : '';

  return '<div class="card'+(v.weakWeb?' weak':'')+'">'
    + '<div class="card-top"><div>'
    + '<p class="vtitle"><a href="'+esc(v.vacLink)+'" target="_blank" rel="noopener">'+esc(v.title)+'</a></p>'
    + '<div class="emp">'+esc(v.employer||"—")+'</div>'
    + '</div></div>'
    + '<div class="badges">'+badges.join("")+'</div>'
    + '<div class="links">'+links.join("")+'</div>'
    + briefBtn
    + '</div>';
}

function render(){
  const q = query.toLowerCase().trim();
  const filtered = DATA.filter(v=>{
    if (activeCat!=="all" && v.cat!==activeCat) return false;
    if (weakOnly && !v.weakWeb) return false;
    if (q){
      const hay = (v.title+" "+v.employer+" "+v.brief+" "+(v.site||"")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const cats = activeCat==="all" ? CAT_ORDER.filter(c=>COUNTS[c]) : [activeCat];
  let out = "";
  let idx = 0;
  let shown = 0;
  cats.forEach(cat=>{
    const items = filtered.filter(v=>v.cat===cat);
    if (!items.length) return;
    shown += items.length;
    out += '<div class="cat-block"><div class="cat-head">'
      + '<h2>'+esc(CAT_META[cat].label)+'</h2>'
      + '<span class="cnt">'+items.length+'</span>'
      + '<span class="cdesc">'+esc(CAT_META[cat].desc)+'</span>'
      + '</div><div class="grid">'
      + items.map(v=>cardHTML(v, idx++)).join("")
      + '</div></div>';
  });
  resultsEl.innerHTML = shown ? out : '<p class="empty">Ничего не найдено. Сбрось фильтры или измени запрос.</p>';

  resultsEl.querySelectorAll(".brief-toggle").forEach(btn=>{
    btn.onclick=()=>{
      const el=document.getElementById("brief-"+btn.dataset.b);
      const open=el.classList.toggle("open");
      btn.textContent=(open?"▾":"▸")+" Описание вакансии";
    };
  });
}

searchEl.oninput = (e)=>{ query=e.target.value; render(); };
weakEl.onchange = (e)=>{ weakOnly=e.target.checked; render(); };

buildChips();
render();
</script>
</body>
</html>`

fs.writeFileSync("onlajn-shkoly-vakansii.html", html)
console.log("HTML written:", html.length, "bytes")
