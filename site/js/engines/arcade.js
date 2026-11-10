// Rechen-Arcade: Sprint auf Zeit mit Combo und steigendem Level
import { h, add, clear, toast, confetti, fmtTime, pick } from '../ui.js';
import { generators, groups } from '../gen/netz.js';
import * as store from '../store.js';

export function arcadeMenu(el, subject) {
  clear(el);
  const modes = [
    ...Object.entries(groups).map(([id, g]) => ({ id, title: g.title, desc: g.desc, gens: generators.filter(x => x.group === id) })),
    { id: 'mix', title: 'Gemischt', desc: 'Alle Aufgabenarten durcheinander.', gens: generators },
  ];
  add(el, 
    h('div', { class: 'page-head' },
      h('a', { class: 'crumb', href: `#/f/${subject.id}` }, subject.title),
      h('h1', {}, 'Rechen-Arcade'),
      h('p', { class: 'lead' }, 'Im Sprint hast du 2 Minuten. Jede richtige Antwort bringt Punkte, und wer mehrmals hintereinander richtig liegt, bekommt mehr. Nach drei richtigen Antworten werden die Aufgaben schwerer. Bei einem Fehler hält die Uhr an, und du siehst den Rechenweg. Im Training gibt es keine Uhr.'),
    ),
    h('div', { class: 'grid3' }, modes.map(m => h('div', { class: 'card arcade-card' },
      h('h3', {}, m.title),
      h('p', { class: 'muted' }, m.desc),
      h('p', { class: 'best' }, 'Dein Rekord: ', h('b', {}, store.getBest(`arcade:${m.id}`)), ' Punkte'),
      h('div', { class: 'row' },
        h('button', { class: 'btn btn-primary', onclick: () => playArcade(el, subject, m, { sprint: true }) }, 'Sprint starten'),
        h('button', { class: 'btn btn-ghost', onclick: () => playArcade(el, subject, m, { sprint: false }) }, 'Training'),
      ),
    ))),
    h('h2', { class: 'section' }, 'Eine Aufgabenart gezielt üben'),
    h('div', { class: 'chips' }, generators.map(g => h('button', { class: 'chip-btn', onclick: () => playArcade(el, subject, { id: 'g:' + g.id, title: g.title, gens: [g] }, { sprint: false }) }, g.title))),
  );
}

export function playArcade(el, subject, mode, { sprint = true } = {}) {
  clear(el);
  const DURATION = 120;
  let left = DURATION, score = 0, combo = 0, level = 1, streakAtLevel = 0, answered = 0, correct = 0;
  let paused = false, over = false, last = performance.now(), raf;

  const timeEl = h('div', { class: 'arc-time' });
  const scoreEl = h('div', { class: 'arc-score' });
  const comboEl = h('div', { class: 'arc-combo' });
  const lvlEl = h('div', { class: 'arc-level' });
  const tbar = h('div', { class: 'arc-bar' }, h('i'));
  const stage = h('div', { class: 'arc-stage' });

  add(el, 
    h('div', { class: 'run-head' },
      h('h2', {}, `${mode.title}: ${sprint ? 'Sprint' : 'Training'}`),
      h('button', { class: 'btn btn-ghost', onclick: () => end(true) }, sprint ? 'Abbrechen' : 'Beenden'),
    ),
    h('div', { class: 'arc-hud' }, sprint ? timeEl : null, scoreEl, comboEl, lvlEl),
    sprint ? tbar : null,
    stage,
  );

  function hud() {
    timeEl.innerHTML = `<small>Zeit</small>${fmtTime(left)}`;
    timeEl.classList.toggle('warn', left < 20);
    tbar.firstChild.style.width = (left / DURATION * 100) + '%';
    scoreEl.innerHTML = `<small>Punkte</small>${score}`;
    comboEl.innerHTML = `<small>Faktor</small>${mult()}-fach`;
    comboEl.classList.toggle('hot', combo >= 3);
    lvlEl.innerHTML = `<small>Stufe</small>${level} von 3`;
  }
  const mult = () => Math.min(5, 1 + Math.floor(combo / 2));

  function loop(t) {
    if (over) return;
    const dt = (t - last) / 1000; last = t;
    if (sprint && !paused) { left -= dt; if (left <= 0) { left = 0; hud(); return end(); } }
    hud();
    raf = requestAnimationFrame(loop);
  }

  function next() {
    if (over) return;
    paused = false; last = performance.now();
    const g = pick(mode.gens);
    const task = g.make(level);
    clear(stage);
    const inp = h('input', { class: 'input big', autocomplete: 'off', spellcheck: 'false', placeholder: 'Antwort eingeben, dann Enter' });
    const fb = h('div', { class: 'arc-fb' });
    const card = h('div', { class: 'arc-card' },
      h('div', { class: 'arc-tag' }, g.title),
      h('div', { class: 'arc-q', html: task.q }),
      h('div', { class: 'row' }, inp, h('button', { class: 'btn btn-ghost', onclick: skip }, 'Überspringen')),
      fb,
    );
    add(stage, card);
    setTimeout(() => inp.focus(), 20);
    let done = false;
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || done) return;
      e.preventDefault();
      if (!inp.value.trim()) return;
      done = true;
      const ok = task.check(inp.value);
      answered++;
      store.record(`${subject.id}/${g.topic}`, ok);
      if (ok) {
        correct++; combo++; streakAtLevel++;
        const pts = 10 * level * mult();
        score += pts;
        card.classList.add('flash-ok');
        float(`+${pts}`);
        if (streakAtLevel >= 3 && level < 3) { level++; streakAtLevel = 0; toast(`Stufe ${level}: Die Aufgaben werden schwerer.`, 'xp', 1600); }
        hud();
        setTimeout(next, 280);
      } else {
        combo = 0; streakAtLevel = 0;
        if (level > 1 && sprint) level--;
        paused = true; hud();
        card.classList.add('flash-bad');
        inp.disabled = true;
        add(fb, 
          h('div', { class: 'fb-title' }, 'Richtig ist: ', h('b', { class: 'mono' }, task.answer)),
          h('div', { class: 'fb-explain', html: task.explain }),
          h('div', { class: 'row' }, h('button', { class: 'btn btn-primary', id: 'arcnext', onclick: next }, 'Weiter'), h('span', { class: 'muted small' }, sprint ? 'Die Uhr ist angehalten, bis du weiterklickst.' : '')),
        );
        setTimeout(() => document.getElementById('arcnext')?.focus(), 30);
      }
    });
    function skip() {
      if (done) return; done = true; combo = 0; streakAtLevel = 0;
      paused = true; hud();
      add(fb, 
        h('div', { class: 'fb-title' }, 'Lösung: ', h('b', { class: 'mono' }, task.answer)),
        h('div', { class: 'fb-explain', html: task.explain }),
        h('div', { class: 'row' }, h('button', { class: 'btn btn-primary', id: 'arcnext', onclick: next }, 'Weiter')),
      );
      setTimeout(() => document.getElementById('arcnext')?.focus(), 30);
    }
  }

  function float(txt) {
    const f = h('div', { class: 'float' }, txt);
    add(stage, f); setTimeout(() => f.remove(), 800);
  }

  function end(aborted = false) {
    if (over) return; over = true;
    cancelAnimationFrame(raf);
    const xp = Math.round(score / 5);
    if (xp) store.addXP(xp);
    const key = `arcade:${mode.id}`;
    const record = sprint && !aborted && store.setBest(key, score);
    if (record) confetti(80);
    clear(stage);
    add(stage, h('div', { class: 'end' },
      h('div', { class: 'big-score' }, score),
      h('h2', {}, record ? 'Neuer Rekord.' : aborted ? 'Beendet.' : 'Die Zeit ist um.'),
      h('p', { class: 'muted' }, `${correct} von ${answered} Aufgaben richtig. Dein Rekord liegt bei ${store.getBest(key)} Punkten.`),
      h('div', { class: 'row center' },
        h('button', { class: 'btn btn-primary', onclick: () => playArcade(el, subject, mode, { sprint }) }, 'Nochmal'),
        h('button', { class: 'btn btn-ghost', onclick: () => arcadeMenu(el, subject) }, 'Andere Auswahl'),
      ),
    ));
  }

  hud(); next(); raf = requestAnimationFrame(loop);
  // Seitenwechsel beendet die Schleife
  window.addEventListener('hashchange', () => { over = true; cancelAnimationFrame(raf); }, { once: true });
}
