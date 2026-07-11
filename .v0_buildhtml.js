const fs = require("fs");

const data = JSON.parse(fs.readFileSync(".v0_merged.json", "utf8"));

const CAT_LABELS = {
  mkt: "Маркетинг",
  dev: "Разработка",
  design: "Дизайн",
  big: "Крупные компании",
};
const CAT_ORDER = ["mkt", "dev", "design", "big"];

const generatedAt = new Date().toISOString().slice(0, 10);

const stats = {
  total: data.length,
  withSite: data.filter((d) => d.site).length,
  weakWeb: data.filter((d) => !d.site || d.weakWeb).length,
};

const json = JSON.stringify(data)
  .replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e")
  .replace(/&/g, "\\u0026");

const html = `<!DOCTYPE html>
<html lang="ru" class="bg-app">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Онлайн-школы — вакансии для отклика</title>
<style>
  :root{
    --bg:#f4f4f2; --surface:#ffffff; --ink:#1c1917; --muted:#78716c;
    --line:#e7e5e4; --accent:#0d9488; --accent-ink:#ffffff; --warn:#b45309; --warn-bg:#fef3c7;
    --dev:#1d4ed8; --design:#7c3aed; --mkt:#0d9488; --big:#57534e;
    --radius:14px;
  }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}
  a{color:var(--accent);text-decoration:none}
  a:hover{text-decoration:underline}
  .wrap{max-width:1120px;margin:0 auto;padding:24px 20px 80px}
  header.top{padding:12px 0 20px;border-bottom:1px solid var(--line);margin-bottom:20px}
  h1{font-size:26px;margin:0 0 6px;letter-spacing:-.01em}
  .sub{color:var(--muted);font-size:14px;margin:0}
  .portfolio{display:inline-flex;align-items:center;gap:8px;margin-top:12px;background:var(--surface);border:1px solid var(--line);padding:8px 12px;border-radius:10px;font-size:13px}
  .portfolio b{color:var(--ink)}
  .stats{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-size:13px;color:var(--muted)}
  .stats b{color:var(--ink);font-size:15px}
  .controls{position:sticky;top:0;z-index:5;background:var(--bg);padding:14px 0;border-bottom:1px solid var(--line);margin-bottom:8px}
  .searchrow{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  #q{flex:1;min-width:220px;padding:11px 14px;border:1px solid var(--line);border-radius:10px;font-size:14px;background:var(--surface);color:var(--ink)}
  #q:focus{outline:2px solid var(--accent);outline-offset:1px}
  .filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .chip{border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:7px 13px;border-radius:999px;font-size:13px;cursor:pointer;user-select:none}
  .chip[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
  .chip.toggle[aria-pressed="true"]{background:var(--warn);border-color:var(--warn)}
  .count{color:var(--muted);font-size:13px;margin:14px 0 6px}
  section.group{margin-top:26px}
  .group h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid var(--line)}
  .grid{display:grid;grid-template-columns:1fr;gap:14px}
  @media(min-width:720px){.grid{grid-template-columns:1fr 1fr}}
  .card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:16px 16px 14px;display:flex;flex-direction:column;gap:10px}
  .card h3{margin:0;font-size:16px;line-height:1.35}
  .card h3 a{color:var(--ink)}
  .meta{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:13px;color:var(--muted)}
  .meta .emp{color:var(--ink);font-weight:600}
  .salary{color:var(--accent);font-weight:600}
  .tags{display:flex;gap:6px;flex-wrap:wrap}
  .tag{font-size:11px;padding:3px 8px;border-radius:6px;background:var(--line);color:var(--ink)}
  .tag.cat-dev{background:#dbeafe;color:var(--dev)}
  .tag.cat-design{background:#ede9fe;color:var(--design)}
  .tag.cat-mkt{background:#ccfbf1;color:#0f766e}
  .tag.cat-big{background:#e7e5e4;color:var(--big)}
  .tag.weak{background:var(--warn-bg);color:var(--warn)}
  .brief{font-size:13.5px;color:#44403c;margin:0}
  .brief.clamp{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .more{align-self:flex-start;background:none;border:none;color:var(--accent);font-size:12.5px;cursor:pointer;padding:0}
  .links{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px;padding-top:10px;border-top:1px solid var(--line)}
  .btn{font-size:12.5px;padding:6px 11px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);display:inline-flex;align-items:center;gap:5px}
  .btn.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
  .btn.site{border-color:var(--accent);color:var(--accent)}
  .empty{text-align:center;color:var(--muted);padding:60px 0;font-size:15px}
  footer{margin-top:50px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:12.5px}
</style>
</head>
<body class="bg-app">
<div class="wrap">
  <header class="top">
    <h1>Онлайн-школы — вакансии для отклика</h1>
    <p class="sub">Отобрано с hh.ru по запросу «онлайн школа». Группировка по типу роли, поиск и фильтры. Данные на ${generatedAt}.</p>
    <div class="portfolio">🎯 Портфолио-заготовка под школу: <b><a href="https://courses.ctrlcat.my/" target="_blank" rel="noopener">courses.ctrlcat.my</a></b></div>
    <div class="stats">
      <span><b>${stats.total}</b> вакансий</span>
      <span><b>${stats.withSite}</b> с сайтом компании</span>
      <span><b>${stats.weakWeb}</b> без/со слабым сайтом — под оффер по сайту</span>
    </div>
  </header>

  <div class="controls">
    <div class="searchrow">
      <input id="q" type="search" placeholder="Поиск по названию, компании, описанию…" autocomplete="off">
    </div>
    <div class="filters" id="cats"></div>
    <div class="filters">
      <button class="chip toggle" id="weakToggle" aria-pressed="false">Только без/со слабым сайтом</button>
      <button class="chip toggle" id="siteToggle" aria-pressed="false">Только с сайтом</button>
    </div>
  </div>

  <div class="count" id="count"></div>
  <div id="results"></div>

  <footer>
    Инструмент для поиска работы. Контакты работодателей hh не публикует — отклик через кнопку «Откликнуться» на странице вакансии.<br>
    Как собирались данные — см. файл <b>КАК-СОБИРАЛИСЬ-ДАННЫЕ.md</b> в архиве проекта.
  </footer>
</div>

<script>
const DATA = JSON.parse(${JSON.stringify(json)});
const CAT_LABELS = ${JSON.stringify(CAT_LABELS)};
const CAT_ORDER = ${JSON.stringify(CAT_ORDER)};

const state = { q:"", cat:"all", weak:false, site:false };

const catsEl = document.getElementById("cats");
const allBtn = mkChip("all","Все ("+DATA.length+")");
catsEl.appendChild(allBtn);
CAT_ORDER.forEach(c=>{
  const n = DATA.filter(d=>d.cat===c).length;
  if(n) catsEl.appendChild(mkChip(c, CAT_LABELS[c]+" ("+n+")"));
});

function mkChip(val,label){
  const b=document.createElement("button");
  b.className="chip"; b.textContent=label; b.dataset.cat=val;
  b.setAttribute("aria-pressed", val==="all"?"true":"false");
  b.onclick=()=>{ state.cat=val; [...catsEl.children].forEach(c=>c.setAttribute("aria-pressed", c.dataset.cat===val?"true":"false")); render(); };
  return b;
}

document.getElementById("q").addEventListener("input",e=>{ state.q=e.target.value.toLowerCase().trim(); render(); });
const weakT=document.getElementById("weakToggle");
weakT.onclick=()=>{ state.weak=!state.weak; weakT.setAttribute("aria-pressed",state.weak); render(); };
const siteT=document.getElementById("siteToggle");
siteT.onclick=()=>{ state.site=!state.site; siteT.setAttribute("aria-pressed",state.site); render(); };

function esc(s){ return (s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function host(u){ try{ return new URL(u).hostname.replace(/^www\\./,""); }catch(e){ return u; } }
function socialLabel(u){ const h=host(u); if(/t\\.me|telegram/.test(u))return "Telegram"; if(/instagram/.test(u))return "Instagram"; if(/vk\\.com/.test(u))return "VK"; if(/youtu/.test(u))return "YouTube"; if(/wa\\.me|whatsapp/.test(u))return "WhatsApp"; return h; }

function match(d){
  if(state.cat!=="all" && d.cat!==state.cat) return false;
  if(state.weak && (d.site && !d.weakWeb)) return false;
  if(state.site && !d.site) return false;
  if(state.q){
    const hay=(d.title+" "+d.employer+" "+d.brief+" "+(d.loc||"")).toLowerCase();
    if(!hay.includes(state.q)) return false;
  }
  return true;
}

function render(){
  const res=document.getElementById("results");
  const items=DATA.filter(match);
  document.getElementById("count").textContent="Показано: "+items.length+" из "+DATA.length;
  res.innerHTML="";
  if(!items.length){ res.innerHTML='<div class="empty">Ничего не найдено. Сбросьте фильтры или измените запрос.</div>'; return; }
  const groups = state.cat==="all" ? CAT_ORDER : [state.cat];
  groups.forEach(cat=>{
    const list=items.filter(d=>d.cat===cat);
    if(!list.length) return;
    const sec=document.createElement("section"); sec.className="group";
    sec.innerHTML="<h2>"+CAT_LABELS[cat]+" — "+list.length+"</h2>";
    const grid=document.createElement("div"); grid.className="grid";
    list.forEach(d=>grid.appendChild(card(d)));
    sec.appendChild(grid); res.appendChild(sec);
  });
}

function card(d){
  const el=document.createElement("article"); el.className="card";
  const weak = !d.site || d.weakWeb;
  let tags='<span class="tag cat-'+d.cat+'">'+CAT_LABELS[d.cat]+'</span>';
  if(weak) tags+='<span class="tag weak">без/слабый сайт → оффер</span>';
  let links='<a class="btn primary" href="'+d.vacLink+'" target="_blank" rel="noopener">Вакансия ↗</a>';
  if(d.empLink) links+='<a class="btn" href="'+d.empLink+'" target="_blank" rel="noopener">Компания</a>';
  if(d.site) links+='<a class="btn site" href="'+esc(d.site)+'" target="_blank" rel="noopener">Сайт: '+esc(host(d.site))+' ↗</a>';
  (d.socials||[]).forEach(s=>{ links+='<a class="btn" href="'+esc(s)+'" target="_blank" rel="noopener">'+esc(socialLabel(s))+' ↗</a>'; });

  el.innerHTML=
    '<div class="tags">'+tags+'</div>'+
    '<h3><a href="'+d.vacLink+'" target="_blank" rel="noopener">'+esc(d.title)+'</a></h3>'+
    '<div class="meta"><span class="emp">'+esc(d.employer)+'</span>'+
      (d.salary?'<span class="salary">'+esc(d.salary)+'</span>':'<span>з/п не указана</span>')+
      (d.loc?'<span>'+esc(d.loc)+'</span>':'')+'</div>'+
    (d.brief?'<p class="brief clamp">'+esc(d.brief)+'</p><button class="more">Показать полностью</button>':'')+
    '<div class="links">'+links+'</div>';

  const more=el.querySelector(".more");
  if(more){ more.onclick=()=>{ const b=el.querySelector(".brief"); const c=b.classList.toggle("clamp"); more.textContent=c?"Показать полностью":"Свернуть"; }; }
  return el;
}

render();
</script>
</body>
</html>`;

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/vakansii.html", html);
console.log("written public/vakansii.html —", html.length, "bytes,", data.length, "vacancies");
