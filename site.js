const btn = document.querySelector('.menu-btn'), nav = document.querySelector('.topnav');
btn?.addEventListener('click', () => { btn.setAttribute('aria-expanded', nav.classList.toggle('open')); setHH(); });
const banner = document.querySelector('.banner');
const setHH = () => document.documentElement.style.setProperty('--hh', banner.offsetHeight + 'px');
setHH(); addEventListener('resize', setHH);
const toc = document.querySelector('.toc details');
if (toc && matchMedia('(max-width: 860px)').matches) toc.open = false;
const links = [...document.querySelectorAll('.toc a')];
if (links.length) {
  const box = document.querySelector('.toc');
  const heads = links.map(a => [document.getElementById(decodeURIComponent(a.hash.slice(1))), a]).filter(([h]) => h);
  let cur = null;
  const setOpen = (li, on) => { li.classList.toggle('open', on); li.querySelector(':scope > .row > .tg')?.setAttribute('aria-expanded', on); };
  box.querySelectorAll('.tg').forEach(b => b.addEventListener('click', () => {
    const li = b.closest('li'), on = !li.classList.contains('open');
    setOpen(li, on); li.dataset.pin = on ? '1' : '0';
  }));
  const mark = a => {
    if (a === cur) return;
    cur?.classList.remove('cur'); cur = a; if (!a) return;
    a.classList.add('cur');
    const path = new Set();
    for (let li = a.closest('li'); li; li = li.parentElement.closest('li')) path.add(li);
    box.querySelectorAll('li.has').forEach(li => setOpen(li, path.has(li) || li.dataset.pin === '1'));
    const b = box.getBoundingClientRect(), r = a.getBoundingClientRect();
    if (box.scrollHeight > box.clientHeight && (r.top < b.top + 40 || r.bottom > b.bottom - 20))
      box.scrollTo({ top: box.scrollTop + r.top - b.top - box.clientHeight / 3, behavior: 'smooth' });
  };
  const update = () => {
    const line = banner.getBoundingClientRect().bottom + 24;
    let hit = null;
    for (const [h, a] of heads) { if (h.getBoundingClientRect().top <= line) hit = a; else break; }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) hit = heads[heads.length - 1][1];
    mark(hit);
  };
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; update(); }); } }, { passive: true });
  links.forEach(a => a.addEventListener('click', () => mark(a)));
  update();
}
const results = document.getElementById('results');
if (results) {
  const q = new URLSearchParams(location.search).get('q')?.trim() || '';
  document.querySelector('.search input').value = q;
  if (q) {
    results.innerHTML = '<p>찾는 중…</p>';
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const pat = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(pat(q), 'i');
    fetch('search-index.json').then(r => r.json()).then(idx => {
      const hits = idx.filter(([, , , h, t]) => re.test(h + ' ' + t));
      if (!hits.length) { results.innerHTML = `<p>“${esc(q)}”에 맞는 결과가 없습니다.</p>`; return; }
      const mark = new RegExp(pat(esc(q)), 'gi');
      const shown = hits.slice(0, 200).map(([slug, id, ch, h, t]) => {
        const i = t.search(re), snip = esc(t.slice(Math.max(0, i - 60), i + 140)).replace(mark, m => `<mark>${m}</mark>`);
        return `<div class="result"><a href="${slug}.html${id ? '#' + encodeURIComponent(id) : ''}">${esc(h)}</a>
          <div class="where">${esc(ch)}</div>${t ? `<p>${i > 60 ? '…' : ''}${snip}…</p>` : ''}</div>`;
      });
      results.innerHTML = `<p>${hits.length}건${hits.length > 200 ? ' (앞 200건만 표시)' : ''}</p>` + shown.join('');
    });
  }
}
