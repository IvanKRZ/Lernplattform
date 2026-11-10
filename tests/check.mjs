// Prüft Inhalte und Rechen-Generatoren ohne Browser: node tests/check.mjs
// Bricht mit Exit-Code 1 ab, wenn etwas nicht stimmt.
import { subjects } from '../site/content/subjects.js';
import { generators } from '../site/js/gen/netz.js';

const errors = [];
const err = (ref, msg) => errors.push(`${ref}: ${msg}`);

for (const s of subjects.filter(x => x.status === 'aktiv')) {
  const ids = new Set();
  for (const t of s.topics) {
    for (const f of ['id', 'title', 'color', 'blurb']) if (!t[f]) err(`${s.id}/${t.id}`, `Feld ${f} fehlt`);
    if (!t.learn?.length) err(`${s.id}/${t.id}`, 'keine Lernseite (learn)');
    for (const q of t.questions || []) {
      const ref = `${s.id}/${t.id}/${q.id}`;
      if (ids.has(ref)) err(ref, 'doppelte ID'); ids.add(ref);
      if (!q.explain) err(ref, 'keine Erklärung');
      if (q.type === 'mc' && !(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length)) err(ref, 'mc: answer ist kein gültiger Index');
      if (q.type === 'multi' && !(Array.isArray(q.answer) && q.answer.length && q.answer.every(i => Number.isInteger(i) && i < q.options.length))) err(ref, 'multi: answer muss eine Liste gültiger Indizes sein');
      if (q.type === 'tf' && typeof q.answer !== 'boolean') err(ref, 'tf: answer muss true oder false sein');
      if (q.type === 'input' && !q.accept?.length) err(ref, 'input: accept fehlt');
      if (q.options && new Set(q.options).size !== q.options.length) err(ref, 'doppelte Antwortoption');
    }
    for (const p of t.pairs || []) if (p.items.some(x => x.length !== 2)) err(`${s.id}/${t.id}`, `Zuordnen-Set „${p.title}“ hat Einträge ohne Paar`);
    for (const g of t.gens || []) if (!generators.some(x => x.id === g)) err(`${s.id}/${t.id}`, `Generator ${g} gibt es nicht`);
  }
}

// Paketreisen: Jede konkrete MAC im Frame muss in der Grafik an einem Gerät stehen, sonst fehlt die Markierung.
for (const s of subjects) for (const j of s.journeys || []) {
  const macs = new Set(j.nodes.flatMap(n => (n.mac || []).map(([, m]) => m)));
  for (const [i, st] of j.steps.entries()) for (const obj of [st.packet, st.reveal]) for (const k of ['smac', 'dmac']) {
    const m = obj?.[k];
    if (m && /^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/.test(m) && !macs.has(m)) err(`${s.id}/reise/${j.id}#${i}`, `${k} ${m} steht an keinem Gerät`);
  }
}

// Jeder Generator muss seine eigene Musterlösung als richtig erkennen und eine leere Eingabe ablehnen.
for (const g of generators) for (const lvl of [1, 2, 3]) for (let i = 0; i < 200; i++) {
  const t = g.make(lvl);
  const tries = [t.answer, t.answer.split(' ')[0], t.answer.split(' (')[0]];
  if (!tries.some(x => t.check(x))) { err(`gen:${g.id}`, `Musterlösung „${t.answer}“ wird nicht akzeptiert`); break; }
  if (t.check('')) { err(`gen:${g.id}`, 'leere Eingabe wird akzeptiert'); break; }
  if (/NaN|undefined/.test(t.q + t.answer + t.explain)) { err(`gen:${g.id}`, 'NaN oder undefined im Text'); break; }
}

if (errors.length) { console.error(errors.join('\n')); console.error(`\n${errors.length} Fehler`); process.exit(1); }
console.log('Alles in Ordnung.');
