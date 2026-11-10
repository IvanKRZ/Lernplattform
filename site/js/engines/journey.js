// Paketreise: Netz als SVG, Paket wandert Schritt für Schritt, an jeder Station eine Frage
import { h, add, clear, shuffle, confetti } from '../ui.js';
import * as store from '../store.js';

const ICON = {
  pc: '<rect x="-22" y="-16" width="44" height="28" rx="3"/><rect x="-10" y="14" width="20" height="4"/>',
  switch: '<rect x="-30" y="-12" width="60" height="24" rx="4"/><path d="M-18 -2h10M-18 4h10M8 -2h10M8 4h10"/>',
  router: '<circle r="20"/><path d="M-10 0h20M0 -10v20M-6 -6l12 12M6 -6l-12 12" />',
  cloud: '<path d="M-28 10a12 12 0 0 1 2-23a16 16 0 0 1 30-4a12 12 0 0 1 24 10a10 10 0 0 1-4 17z"/>',
  server: '<rect x="-16" y="-22" width="32" height="44" rx="3"/><path d="M-10 -12h20M-10 -2h20M-10 8h20"/>',
};

export function journeyMenu(el, subject) {
  clear(el);
  add(el, 
    h('div', { class: 'page-head' },
      h('a', { class: 'crumb', href: `#/f/${subject.id}` }, subject.title),
      h('h1', {}, 'Paketreise'),
      h('p', { class: 'lead' }, 'Du begleitest ein Paket durch ein Netz. An jeder Station entscheidest du, was als Nächstes passiert. Links siehst du, welche Adressen gerade im Paket stehen. Was sich geändert hat, ist markiert.'),
    ),
    h('div', { class: 'grid3' }, subject.journeys.map(j => h('a', { class: 'card card-link', href: `#/f/${subject.id}/reise/${j.id}` },
      h('h3', {}, j.title), h('p', { class: 'muted' }, j.desc),
      h('p', { class: 'small muted' }, `${j.steps.filter(s => s.q).length} Fragen unterwegs`),
    ))),
  );
}

export function playJourney(el, subject, j) {
  clear(el);
  const xs = j.nodes.map(n => n.x), ys = j.nodes.map(n => n.y);
  const X0 = Math.min(...xs) - 95, Y0 = Math.min(...ys) - 70;
  const W = Math.max(...xs) + 95 - X0, H = Math.max(...ys) + 105 - Y0;
  const pos = id => j.nodes.find(n => n.id === id);
  const svg = `<svg viewBox="${X0} ${Y0} ${W} ${H}" class="netmap">
    ${j.links.map(([a, b, l]) => { const A = pos(a), B = pos(b); return `<g class="lnk" data-k="${a}-${b}"><line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>${l ? `<text x="${(A.x + B.x) / 2}" y="${(A.y + B.y) / 2 - 10}">${l}</text>` : ''}</g>`; }).join('')}
    ${j.nodes.map(n => `<g class="node node-${n.kind}" data-id="${n.id}" transform="translate(${n.x},${n.y})"><g class="ico">${ICON[n.kind]}</g><text class="nl" y="44">${n.label}</text><text class="ns" y="60">${(n.sub || '').split(' · ').map((t, k) => `<tspan x="0" dy="${k ? 13 : 0}">${t}</tspan>`).join('')}</text></g>`).join('')}
    <g class="pkt" transform="translate(${j.nodes[0].x},${j.nodes[0].y - 34})"><rect x="-14" y="-9" width="28" height="18" rx="3"/><path d="M-14 -9l14 10l14 -10"/></g>
  </svg>`;
  const net = h('div', { class: 'net-wrap', html: svg });
  const hdr = h('div', { class: 'hdr' });
  const tbl = h('pre', { class: 'pre rtable' });
  const tblBox = h('div', { class: 'hidden' }, h('h4', {}, 'Routing-Tabelle von R1'), tbl);
  const panel = h('div', { class: 'jpanel' });
  const prog = h('div', { class: 'steps-dots' });
  add(el, 
    h('div', { class: 'run-head' }, h('div', {}, h('a', { class: 'crumb', href: `#/f/${subject.id}/reise` }, 'Alle Paketreisen'), h('h2', {}, j.title)), prog),
    net,
    h('div', { class: 'jgrid' }, h('div', {}, h('h4', {}, 'Was gerade im Paket steht'), hdr, tblBox), panel),
  );
  j.steps.forEach(() => add(prog, h('i')));

  let pkt = {}, step = 0, ok = 0, total = 0;
  const F = [['smac', 'Quell-MAC'], ['dmac', 'Ziel-MAC'], ['vlan', 'VLAN-Tag'], ['sip', 'Quell-IP'], ['dip', 'Ziel-IP'], ['sport', 'Quell-Port'], ['dport', 'Ziel-Port']];
  function drawHdr(changed = []) {
    clear(hdr);
    if (!Object.keys(pkt).length) { add(hdr, h('p', { class: 'muted small' }, 'Noch ist kein Paket unterwegs.')); return; }
    F.forEach(([k, l]) => add(hdr, h('div', { class: `hf ${changed.includes(k) ? 'chg' : ''} ${k === 'vlan' && (!pkt.vlan || pkt.vlan === '–') ? 'dim' : ''}` }, h('span', {}, l), h('b', { class: 'mono' }, pkt[k] ?? '–'))));
  }
  function movePkt(at) {
    let x, y;
    if (Array.isArray(at)) { const A = pos(at[0]), B = pos(at[1]); x = (A.x + B.x) / 2; y = (A.y + B.y) / 2 - 2; }
    else { const n = pos(at); x = n.x; y = n.y - 38; }
    net.querySelector('.pkt').setAttribute('transform', `translate(${x},${y})`);
    net.querySelectorAll('.node').forEach(n => n.classList.toggle('active', !Array.isArray(at) && n.dataset.id === at));
    net.querySelectorAll('.lnk').forEach(l => l.classList.toggle('active', Array.isArray(at) && (l.dataset.k === `${at[0]}-${at[1]}` || l.dataset.k === `${at[1]}-${at[0]}`)));
  }
  function apply(obj) {
    if (!obj) return [];
    const ch = Object.keys(obj).filter(k => pkt[k] !== obj[k]);
    Object.assign(pkt, obj); return ch;
  }

  function show() {
    [...prog.children].forEach((d, i) => d.className = i < step ? 'done' : i === step ? 'cur' : '');
    if (step >= j.steps.length) return finish();
    const s = j.steps[step];
    movePkt(s.at);
    let changed = [];
    if (s.packet) { pkt = { ...s.packet }; changed = Object.keys(s.packet); }
    drawHdr(changed);
    tblBox.classList.toggle('hidden', !s.table);
    tbl.textContent = s.table || '';
    clear(panel);
    add(panel, h('div', { class: 'jtext', html: s.text }));
    if (!s.q) {
      if (s.reveal) drawHdr(apply(s.reveal));
      add(panel, h('button', { class: 'btn btn-primary', onclick: () => { step++; show(); } }, step === j.steps.length - 1 ? 'Abschließen' : 'Weiter'));
      return;
    }
    total++;
    const opts = shuffle(s.q.options.map((t, i) => ({ t, i })));
    const list = h('div', { class: 'options' });
    add(panel, h('div', { class: 'item-q', html: s.q.q }), list);
    opts.forEach((o, n) => add(list, h('button', { class: 'opt', onclick: () => answer(o) }, h('kbd', {}, n + 1), h('span', { html: o.t }))));
    let answered = false;
    function answer(o) {
      if (answered) return; answered = true;
      const good = o.i === s.q.answer;
      if (good) { ok++; store.addXP(10); }
      store.record(`${subject.id}/${j.topics[0]}`, good);
      [...list.children].forEach((b, idx) => { const oi = opts[idx].i; if (oi === s.q.answer) b.classList.add('right'); else if (opts[idx] === o) b.classList.add('wrong'); b.disabled = true; });
      drawHdr(apply(s.reveal));
      add(panel, 
        h('div', { class: `feedback ${good ? 'is-ok' : 'is-bad'}` },
          h('div', { class: 'fb-title' }, good ? 'Richtig.' : 'Leider falsch.'),
          h('div', { class: 'fb-explain', html: s.q.explain })),
        h('button', { class: 'btn btn-primary', id: 'jnext', onclick: () => { step++; show(); } }, 'Weiter'),
      );
      setTimeout(() => document.getElementById('jnext')?.focus(), 30);
    }
    const kh = e => {
      if (!list.isConnected) return document.removeEventListener('keydown', kh);
      const n = Number(e.key); if (!answered && n >= 1 && n <= opts.length) list.children[n - 1].click();
    };
    document.addEventListener('keydown', kh);
  }
  function finish() {
    clear(panel);
    if (ok === total) confetti(60);
    add(panel, h('div', { class: 'end small-end' },
      h('h3', {}, `${ok} von ${total} Fragen richtig beantwortet.`),
      h('div', { class: 'row center' },
        h('button', { class: 'btn btn-primary', onclick: () => playJourney(el, subject, j) }, 'Nochmal'),
        h('a', { class: 'btn btn-ghost', href: `#/f/${subject.id}/reise` }, 'Andere Reise'))));
  }
  drawHdr(); show();
}
