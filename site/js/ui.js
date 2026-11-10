// Kleine DOM-Helfer ohne Framework
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    // data-* und aria-* sind Textwerte: true/false müssen als "true"/"false" ankommen.
    // Nur echte HTML-Schalter (disabled, autofocus …) werden bei false weggelassen.
    if (k.startsWith('data-') || k.startsWith('aria-')) { if (v != null) el.setAttribute(k, String(v)); continue; }
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; }
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// append ohne null/false und mit verschachtelten Arrays
export function add(el, ...children) { el.append(...children.flat(Infinity).filter(c => c != null && c !== false)); return el; }

export function clear(el) { while (el.firstChild) el.firstChild.remove(); return el; }

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function sample(arr, n) { return shuffle(arr).slice(0, n); }

let toastBox;
export function toast(msg, kind = 'info', ms = 2600) {
  if (!toastBox) { toastBox = h('div', { class: 'toasts' }); document.body.append(toastBox); }
  const t = h('div', { class: `toast toast-${kind}` }, msg);
  toastBox.append(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

export function confetti(n = 60) {
  const colors = ['#E07020', '#2E8B57', '#2D6CDF', '#8A5A3C', '#D9A400', '#1A9AA0'];
  const box = h('div', { class: 'confetti' });
  for (let i = 0; i < n; i++) {
    const p = h('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.4 + 's';
    p.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.append(p);
  }
  document.body.append(box);
  setTimeout(() => box.remove(), 3500);
}

// "Fehler melden": kopiert eine Referenz, die man dem Admin schicken kann
export function reportButton(ref, text) {
  return h('button', {
    class: 'btn-link report', title: 'Aufgabe falsch oder unklar? Referenz kopieren',
    onclick: async () => {
      const msg = `[Lernstack Fehlermeldung] ${ref}\n${text || ''}\nWas ist falsch: `;
      try { await navigator.clipboard.writeText(msg); toast('Referenz kopiert – schick sie an Ivan', 'info'); }
      catch { prompt('Referenz kopieren:', msg); }
    },
  }, 'Fehler melden');
}

export function fmtTime(s) {
  s = Math.max(0, Math.ceil(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function normalize(s) {
  return String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// Tastenkürzel, die beim Seitenwechsel automatisch entfernt werden
let keyHandlers = [];
export function onKey(fn) { document.addEventListener('keydown', fn); keyHandlers.push(fn); }
export function clearKeys() { keyHandlers.forEach(fn => document.removeEventListener('keydown', fn)); keyHandlers = []; }

let timers = [];
export function every(fn, ms) { const id = setInterval(fn, ms); timers.push(id); return id; }
export function clearTimers() { timers.forEach(clearInterval); timers = []; }
