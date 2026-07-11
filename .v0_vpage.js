(() => {
  const q = (s) => { const e = document.querySelector(s); return e ? e.innerText.trim() : null; };
  const qh = (s) => { const e = document.querySelector(s); return e ? e.href : null; };
  const desc = q('[data-qa="vacancy-description"]');
  const empLink = qh('[data-qa="vacancy-company-name"]') || qh('a[data-qa="vacancy-company__details"]') || qh('a[href*="/employer/"]');
  const salary = q('[data-qa="vacancy-salary"]') || q('[data-qa="vacancy-salary-compensation-type-net"]');
  const title = q('[data-qa="vacancy-title"]');
  // external links inside description
  const links = [...document.querySelectorAll('[data-qa="vacancy-description"] a')].map(a => a.href).filter(h => h && !h.includes('hh.ru'));
  const brief = desc ? desc.replace(/\s+/g, ' ').slice(0, 700) : null;
  return JSON.stringify({ title, salary, empLink, brief, links: [...new Set(links)].slice(0, 8) });
})()
