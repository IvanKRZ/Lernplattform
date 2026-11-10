// Zuordnen und Reihenfolge
import { h, add, clear, shuffle, toast, confetti, fmtTime, every } from '../ui.js';
import * as store from '../store.js';

// ---------- Zuordnen (Memory-artig, zwei Spalten) ----------
export function playMatch(el, set, { topicKey, backHref, next } = {}) {
  clear(el);
  const pairs = set.items.map(([a, b], i) => ({ a, b, i }));
  const left = shuffle(pairs), right = shuffle(pairs);
  let selL = null, selR = null, solved = 0, mistakes = 0;
  const t0 = Date.now();
  const timeEl = h('span', { class: 'timer' });
  every(() => { timeEl.textContent = fmtTime((Date.now() - t0) / 1000); }, 500);
  const status = h('span', { class: 'score' }, `0/${pairs.length}`);

  const colL = h('div', { class: 'mcol' }), colR = h('div', { class: 'mcol' });
  const mk = (p, side) => h('button', { class: 'mcard', 'data-i': p.i, 'data-side': side, html: side === 'L' ? p.a : p.b, onclick: e => choose(e.currentTarget) });
  left.forEach(p => add(colL, mk(p, 'L')));
  right.forEach(p => add(colR, mk(p, 'R')));

  function choose(btn) {
    if (btn.classList.contains('done')) return;
    const side = btn.dataset.side;
    if (side === 'L') { selL?.classList.remove('sel'); selL = btn; } else { selR?.classList.remove('sel'); selR = btn; }
    btn.classList.add('sel');
    if (selL && selR) {
      const a = selL, b = selR; selL = selR = null;
      // Gleiche rechte Texte (z. B. „Hub“ mehrfach) gelten als richtig
      const ok = a.dataset.i === b.dataset.i || pairs[a.dataset.i].b === pairs[b.dataset.i].b;
      if (ok) {
        [a, b].forEach(x => { x.classList.remove('sel'); x.classList.add('done'); });
        solved++; status.textContent = `${solved}/${pairs.length}`;
        if (solved === pairs.length) finish();
      } else {
        mistakes++;
        [a, b].forEach(x => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake', 'sel'), 450); });
      }
    }
  }

  function finish() {
    const secs = (Date.now() - t0) / 1000;
    const ok = mistakes === 0;
    store.record(topicKey, mistakes <= 1);
    const xp = Math.max(5, pairs.length * 3 - mistakes * 2);
    store.addXP(xp);
    if (ok) confetti(40);
    setTimeout(() => {
      add(el, h('div', { class: 'end small-end' },
        h('h3', {}, ok ? 'Alles fehlerfrei zugeordnet.' : `Geschafft, mit ${mistakes} Fehlversuch${mistakes === 1 ? '' : 'en'}.`),
        h('p', { class: 'muted' }, `Zeit: ${fmtTime(secs)} Min. Du bekommst ${xp} Punkte.`),
        h('div', { class: 'row center' },
          h('button', { class: 'btn btn-primary', onclick: () => playMatch(el, set, { topicKey, backHref, next }) }, 'Nochmal'),
          next ? h('button', { class: 'btn', onclick: next }, 'Nächstes Set') : null,
          backHref ? h('a', { class: 'btn btn-ghost', href: backHref }, 'Zurück') : null,
        )));
    }, 300);
  }

  add(el, 
    h('div', { class: 'run-head' }, h('h2', {}, set.title), h('div', { class: 'run-meta' }, timeEl, status)),
    h('p', { class: 'muted' }, 'Wähle links einen Begriff und dann rechts das passende Gegenstück.'),
    h('div', { class: 'match' }, colL, colR),
  );
}

// ---------- Reihenfolge: in der richtigen Reihenfolge antippen ----------
export function playOrder(el, set, { topicKey, backHref, next } = {}) {
  clear(el);
  const items = set.items.map((t, i) => ({ t, i }));
  const pool = h('div', { class: 'order-pool' });
  const target = h('ol', { class: 'order-target' });
  let pos = 0, mistakes = 0;
  shuffle(items).forEach(it => add(pool, h('button', { class: 'mcard', html: it.t, onclick: e => tap(e.currentTarget, it) })));
  function tap(btn, it) {
    if (it.i === pos) {
      btn.remove(); add(target, h('li', { html: it.t })); pos++;
      if (pos === items.length) finish();
    } else {
      mistakes++; btn.classList.add('shake'); setTimeout(() => btn.classList.remove('shake'), 450);
    }
  }
  function finish() {
    store.record(topicKey, mistakes <= 1);
    const xp = Math.max(5, 15 - mistakes * 3); store.addXP(xp);
    if (!mistakes) confetti(40);
    add(el, h('div', { class: 'end small-end' },
      h('h3', {}, mistakes ? `Fertig, mit ${mistakes} Fehlversuch${mistakes === 1 ? '' : 'en'}.` : 'Alles in der richtigen Reihenfolge.'),
      h('p', { class: 'muted' }, `Du bekommst ${xp} Punkte.`),
      h('div', { class: 'row center' },
        h('button', { class: 'btn btn-primary', onclick: () => playOrder(el, set, { topicKey, backHref, next }) }, 'Nochmal'),
        next ? h('button', { class: 'btn', onclick: next }, 'Nächste Reihenfolge') : null,
        backHref ? h('a', { class: 'btn btn-ghost', href: backHref }, 'Zurück') : null,
      )));
  }
  add(el, 
    h('div', { class: 'run-head' }, h('h2', {}, set.title)),
    h('p', { class: 'muted' }, 'Klicke die Karten in der richtigen Reihenfolge an. Die richtige Karte wandert nach links in die Liste.'),
    h('div', { class: 'order' }, target, pool),
  );
}
