// Rendert eine einzelne Aufgabe (statisch oder generiert) und meldet das Ergebnis.
import { h, add, shuffle, normalize, onKey, reportButton } from '../ui.js';

// Einheitliches Format erzeugen
export function fromQuestion(q, topicKey) {
  return { ...q, ref: `${topicKey}/${q.id}`, topicKey, track: true };
}
export function fromGen(gen, task, topicKey) {
  return { type: 'input', q: task.q, answer: task.answer, check: task.check, explain: task.explain, hint: task.hint, ref: `${topicKey}/gen:${gen.id}`, topicKey, gen: true };
}

function correctText(item, opts) {
  if (item.type === 'mc') return opts.find(o => o.i === item.answer).t;
  if (item.type === 'multi') return opts.filter(o => item.answer.includes(o.i)).map(o => o.t).join(' · ');
  if (item.type === 'tf') return item.answer ? 'Wahr' : 'Falsch';
  if (item.gen) return item.answer;
  return item.accept[0];
}

function checkInput(item, val) {
  if (item.check) return item.check(val);
  const v = normalize(val).replace(/\s/g, '');
  return item.accept.some(a => normalize(a).replace(/\s/g, '') === v);
}

/**
 * @param item  Aufgabe
 * @param opts  { exam: bool (kein Feedback), onAnswer(ok, given), onNext() }
 */
export function renderItem(item, { exam = false, onAnswer, onNext, label, topic, focus = true } = {}) {
  const root = h('div', { class: 'item' });
  const opts = (item.options || []).map((t, i) => ({ t, i }));
  const shown = item.type === 'mc' || item.type === 'multi' ? shuffle(opts) : opts;
  let answered = false;
  let usedHint = false;
  const key = fn => onKey(e => { if (root.isConnected) fn(e); });

  add(root, 
    h('div', { class: 'item-head' },
      label ? h('span', { class: 'item-label' }, label) : null,
      topic ? h('span', { class: 'item-topic', style: { '--c': topic.color } }, topic.title) : null,
      h('span', { class: `item-kind kind-${item.type}` }, { mc: 'Eine Antwort ist richtig.', multi: 'Mehrere Antworten sind richtig.', tf: 'Stimmt das?', input: 'Trage die Antwort ein.' }[item.type]),
    ),
    h('div', { class: 'item-q', html: item.q }),
  );
  if (item.situation) root.querySelector('.item-q').before(h('div', { class: 'situation', html: item.situation }), item.pre ? h('pre', { class: 'pre' }, item.pre) : '');

  const body = h('div', { class: 'item-body' });
  const fb = h('div', { class: 'feedback' });
  add(root, body, fb);

  function finish(ok, given, markEls) {
    if (answered) return;
    answered = true;
    root.classList.add('answered');
    onAnswer && onAnswer(ok, given, usedHint);
    if (exam) { onNext && onNext(); return; }
    markEls && markEls();
    root.classList.add(ok ? 'is-ok' : 'is-bad');
    add(fb, 
      h('div', { class: 'fb-title' }, ok ? pickOk() : 'Leider falsch.'),
      !ok ? h('div', { class: 'fb-correct' }, item.type === 'multi' ? multiSummary(item, root._picked) : null, 'Richtig ist: ', h('b', { html: correctText(item, opts) })) : null,
      item.explain ? h('div', { class: 'fb-explain', html: item.explain }) : null,
      h('div', { class: 'fb-actions' },
        h('button', { class: 'btn btn-primary', onclick: () => onNext && onNext(), autofocus: true }, 'Weiter'),
        reportButton(item.ref, item.q.replace(/<[^>]+>/g, '')),
      ),
    );
    setTimeout(() => fb.querySelector('.btn-primary')?.focus(), 30);
  }

  if (item.type === 'mc') {
    const list = h('div', { class: 'options' });
    shown.forEach((o, n) => {
      const b = h('button', { class: 'opt', 'data-i': o.i, onclick: () => finish(o.i === item.answer, o.t, () => {
        list.querySelectorAll('.opt').forEach(x => {
          const i = Number(x.dataset.i);
          if (i === item.answer) x.classList.add('right');
          else if (x === b) x.classList.add('wrong');
        });
      }) }, h('kbd', {}, n + 1), h('span', { html: o.t }));
      add(list, b);
    });
    add(body, list);
    key(e => {
      if (answered || e.target.tagName === 'INPUT') return;
      const n = Number(e.key);
      if (n >= 1 && n <= shown.length) list.children[n - 1].click();
    });
  }

  if (item.type === 'multi') {
    const list = h('div', { class: 'options' });
    const sel = new Set();
    shown.forEach((o, n) => {
      const b = h('button', { class: 'opt opt-check', 'data-i': o.i, onclick: () => {
        if (answered) return;
        sel.has(o.i) ? sel.delete(o.i) : sel.add(o.i);
        b.classList.toggle('sel');
      } }, h('kbd', {}, n + 1), h('span', { html: o.t }));
      add(list, b);
    });
    const submit = h('button', { class: 'btn btn-primary', onclick: () => {
      const ok = sel.size === item.answer.length && item.answer.every(i => sel.has(i));
      root._picked = [...sel];
      finish(ok, opts.filter(o => sel.has(o.i)).map(o => o.t).join(' · ') || '–', () => list.querySelectorAll('.opt').forEach(x => {
        const i = Number(x.dataset.i);
        const should = item.answer.includes(i), picked = sel.has(i);
        if (should && picked) x.classList.add('right');
        else if (should) { x.classList.add('missed'); add(x, h('span', { class: 'opt-note' }, 'hättest du auch wählen müssen')); }
        else if (picked) { x.classList.add('wrong'); add(x, h('span', { class: 'opt-note' }, 'falsch gewählt')); }
      }));
      submit.remove();
    } }, 'Prüfen');
    add(body, list, h('div', { class: 'row' }, submit, h('span', { class: 'muted small multi-hint' }, 'Wähle alle richtigen Antworten aus und klicke dann auf Prüfen.')));
    key(e => {
      if (answered) return;
      const n = Number(e.key);
      if (n >= 1 && n <= shown.length) list.children[n - 1].click();
      if (e.key === 'Enter') { e.preventDefault(); submit.click(); }
    });
  }

  if (item.type === 'tf') {
    const list = h('div', { class: 'options tf' });
    [[true, 'Wahr'], [false, 'Falsch']].forEach(([v, t], n) => {
      add(list, h('button', { class: 'opt', 'data-v': v, onclick: (e) => finish(v === item.answer, t, () => list.querySelectorAll('.opt').forEach(x => {
        if ((x.dataset.v === 'true') === item.answer) x.classList.add('right'); else if (x.dataset.v === String(v)) x.classList.add('wrong');
      })) }, h('kbd', {}, n + 1), t));
    });
    add(body, list);
    key(e => { if (answered) return; if (e.key === '1') list.children[0].click(); if (e.key === '2') list.children[1].click(); });
  }

  if (item.type === 'input') {
    const inp = h('input', { class: 'input', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'Antwort eingeben …' });
    const submit = h('button', { class: 'btn btn-primary', onclick: () => {
      if (!inp.value.trim()) { inp.focus(); return; }
      const ok = checkInput(item, inp.value);
      inp.disabled = true;
      inp.classList.add(ok ? 'right' : 'wrong');
      finish(ok, inp.value);
      submit.remove(); hintBtn && hintBtn.remove();
    } }, 'Prüfen');
    const hintBox = h('div', { class: 'hint' });
    const hintBtn = item.hint ? h('button', { class: 'btn btn-ghost', onclick: () => { usedHint = true; hintBox.innerHTML = '<b>Tipp:</b> ' + item.hint; hintBtn.remove(); inp.focus(); } }, 'Tipp') : null;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); submit.click(); } });
    add(body, h('div', { class: 'row' }, inp, submit, hintBtn), hintBox);
    if (focus) setTimeout(() => inp.focus(), 30);
  }

  // Enter = Weiter nach Feedback
  key(e => {
    if (!answered || exam) return;
    if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); onNext && onNext(); }
  });

  return root;
}

// Kurzer Satz, was bei der Mehrfachauswahl gefehlt hat oder zu viel war
function multiSummary(item, picked) {
  const set = new Set(picked || []);
  const hit = item.answer.filter(i => set.has(i)).length;
  const extra = [...set].filter(i => !item.answer.includes(i)).length;
  const parts = [`Du hast ${hit} von ${item.answer.length} richtigen Antworten gewählt`];
  if (extra) parts.push(`und ${extra} falsche dazu`);
  return h('span', { class: 'multi-sum' }, parts.join(' ') + '. ');
}

const OK = ['Richtig.', 'Genau.', 'Stimmt.', 'Sitzt.', 'Korrekt.'];
function pickOk() { return OK[Math.floor(Math.random() * OK.length)]; }
