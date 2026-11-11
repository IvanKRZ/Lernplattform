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
  if (!toastBox) { toastBox = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' }); document.body.append(toastBox); }
  const t = h('div', { class: `toast toast-${kind}` }, msg);
  toastBox.append(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

// Schriftfarbe, die auf einer Themenfarbe lesbar ist (dunkel auf hellen, weiß auf dunklen Farben)
export function inkOn(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin(n >> 16 & 255) + 0.7152 * lin(n >> 8 & 255) + 0.0722 * lin(n & 255);
  return L > 0.26 ? '#14171A' : '#FFFFFF';
}

// Dialog statt confirm()/prompt(): bleibt im Stil der Seite und lässt sich mit Esc schließen.
// fields: [{ name, label, type, value, hint, rows }], Rückgabe: Werte als Objekt oder null bei Abbruch.
// onSubmit darf eine Fehlermeldung werfen; sie erscheint im Dialog, und der Dialog bleibt offen.
export function dialog({ title, text, fields = [], submit = 'OK', cancel = 'Abbrechen', danger = false, onSubmit }) {
  return new Promise(resolve => {
    const err = h('p', { class: 'form-error', role: 'alert' });
    const inputs = fields.map(f => f.rows
      ? h('textarea', { name: f.name, rows: f.rows, maxlength: f.maxlength || 1000 }, f.value || '')
      : h('input', { name: f.name, type: f.type || 'text', value: f.value || '', autocomplete: f.autocomplete || 'off', required: f.required }));
    const ok = h('button', { class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, type: 'submit' }, submit);
    const dlg = h('dialog', { class: 'dlg' },
      h('form', { method: 'dialog', onsubmit: async e => {
        e.preventDefault();
        const values = Object.fromEntries(fields.map((f, i) => [f.name, inputs[i].value]));
        if (onSubmit) {
          ok.disabled = true; err.textContent = '';
          try { await onSubmit(values); } catch (ex) { err.textContent = ex.message; ok.disabled = false; return; }
        }
        dlg.close(); resolve(values);
      } },
        h('h2', {}, title),
        text ? h('div', { class: 'dlg-text' }, typeof text === 'string' ? h('p', {}, text) : text) : null,
        fields.map((f, i) => h('label', { class: 'field' }, h('span', {}, f.label), inputs[i], f.hint ? h('small', {}, f.hint) : null)),
        err,
        h('div', { class: 'row' }, ok, cancel ? h('button', { class: 'btn', type: 'button', onclick: () => { dlg.close(); resolve(null); } }, cancel) : null),
      ));
    dlg.addEventListener('cancel', () => resolve(null));
    dlg.addEventListener('close', () => dlg.remove());
    document.body.append(dlg);
    dlg.showModal();
  });
}

// "Fehler melden": schickt die Aufgabe mit einer kurzen Beschreibung an die Verwaltung.
export function reportButton(ref, text) {
  return h('button', {
    class: 'btn-link report', type: 'button',
    onclick: () => dialog({
      title: 'Fehler in dieser Aufgabe melden',
      text: 'Die Meldung geht mit der Nummer der Aufgabe an Ivan. Beschreib kurz, was falsch oder unklar ist.',
      fields: [{ name: 'note', label: 'Was stimmt nicht?', rows: 4 }],
      submit: 'Meldung senden',
      async onSubmit({ note }) {
        if (!note.trim()) throw new Error('Bitte beschreib kurz, was nicht stimmt.');
        const { api } = await import('./api.js');
        await api('POST', '/api/reports', { ref, question: text || '', note });
        toast('Meldung gesendet. Danke.');
      },
    }),
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
