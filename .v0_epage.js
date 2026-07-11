(() => {
  const bad = ['headhunter','hh_ru','hh.ru','hhcdn','setka.ru','hhstatic','/headhunter','apple.com','play.google','itunes'];
  const isBad = (h) => bad.some(b => h.toLowerCase().includes(b));
  const name = (document.querySelector('[data-qa="company-header-title-name"], h1') || {}).innerText || null;
  const descEl = document.querySelector('[data-qa="company-description-text"], [data-qa="company-description"]');
  const desc = descEl ? descEl.innerText.replace(/\s+/g, ' ').trim().slice(0, 500) : null;
  const raw = [...document.querySelectorAll('a')].map(a => a.href)
    .filter(h => h && h.startsWith('http') && !h.includes('hh.ru') && !isBad(h));
  const uniq = [...new Set(raw)];
  const site = uniq.find(h => !/(vk\.com|t\.me|instagram|facebook|youtube|dzen|ok\.ru|wa\.me|whatsapp|telegram)/i.test(h)) || null;
  const social = uniq.filter(h => /(vk\.com|t\.me|instagram|facebook|youtube|dzen|ok\.ru|wa\.me|whatsapp|telegram)/i.test(h)).slice(0, 6);
  return JSON.stringify({ name, site, social, desc });
})()
