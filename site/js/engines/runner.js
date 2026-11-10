// Ablauf für eine Folge von Aufgaben: Quiz, Fälle, Diagnose, Klausur
import { h, add, clear, toast, fmtTime, every } from '../ui.js';
import { topicByKey } from './pool.js';
import { renderItem } from './item.js';
import * as store from '../store.js';

/**
 * @param el     Container
 * @param items  Aufgaben
 * @param cfg    { title, exam, minutes, xp (Basis pro richtige), onFinish(results, el) }
 */
export function runItems(el, items, cfg = {}) {
  clear(el);
  const results = [];
  let i = 0, combo = 0, xpGained = 0;
  const start = Date.now();
  const deadline = cfg.minutes ? start + cfg.minutes * 60e3 : null;

  const bar = h('div', { class: 'progress' }, h('i'));
  const meta = h('div', { class: 'run-meta' });
  const stage = h('div', { class: 'stage' });
  add(el, ...[
    h('div', { class: 'run-head' },
      h('h2', {}, cfg.title || 'Quiz'),
      meta,
    ),
    cfg.intro ? h('p', { class: 'run-intro' }, cfg.intro) : null,
    bar, stage,
    h('p', { class: 'kbd-tip' }, 'Tipp: Du kannst mit den Zahlentasten 1 bis 4 antworten und mit der Eingabetaste weitergehen.'),
  ].filter(Boolean));

  let timerEl;
  if (deadline) {
    timerEl = h('span', { class: 'timer' });
    meta.append(timerEl);
    const tick = () => {
      const left = (deadline - Date.now()) / 1000;
      timerEl.textContent = 'Noch ' + fmtTime(left) + ' Min.';
      timerEl.classList.toggle('warn', left < 300);
      if (left <= 0) { toast('Zeit abgelaufen', 'warn'); done(); }
    };
    tick(); every(tick, 1000);
  }
  const scoreEl = h('span', { class: 'score' });
  const comboEl = h('span', { class: 'combo' });
  if (!cfg.exam) meta.append(comboEl, scoreEl);

  function updateMeta() {
    bar.firstChild.style.width = (i / items.length * 100) + '%';
    const ok = results.filter(r => r.ok).length;
    scoreEl.textContent = results.length ? `${ok} von ${results.length} richtig` : '';
    comboEl.textContent = combo >= 2 ? `${combo} richtig in Folge` : '';
    comboEl.classList.toggle('hot', combo >= 3);
  }

  let finished = false;
  function done() {
    if (finished) return; finished = true;
    bar.firstChild.style.width = '100%';
    if (cfg.exam) {
      // XP erst am Ende in der Klausur
      results.forEach(r => { if (r.ok) store.addXP((cfg.xp || 10)); });
    }
    if (xpGained) toast(`${xpGained} Punkte gesammelt`, 'xp');
    cfg.onFinish ? cfg.onFinish(results, el, { seconds: (Date.now() - start) / 1000, items }) : defaultEnd(el, results, items, cfg);
  }

  function show() {
    updateMeta();
    if (i >= items.length) return done();
    const item = items[i];
    clear(stage);
    add(stage, renderItem(item, {
      exam: cfg.exam,
      label: `Aufgabe ${i + 1} von ${items.length}`,
      topic: cfg.showTopic ? topicByKey(item.topicKey) : null,
      onAnswer(ok, given, usedHint) {
        results.push({ item, ok, given });
        store.record(item.topicKey, ok, item.track ? item.ref : null);
        if (ok) {
          combo++;
          if (!cfg.exam) {
            let xp = (cfg.xp || 10) + (item.gen ? 2 : 0) + Math.min(combo - 1, 4) * 2;
            if (usedHint) xp = Math.round(xp / 2);
            xpGained += xp; store.addXP(xp);
          }
        } else combo = 0;
        if (combo === 5 && !cfg.exam) { toast('5 richtig in Folge: 20 Bonuspunkte', 'xp'); store.addXP(20); xpGained += 20; }
        updateMeta();
      },
      onNext() { i++; show(); },
    }));
  }
  show();
  return { stop: done };
}

export function defaultEnd(el, results, items, cfg) {
  clear(el);
  const ok = results.filter(r => r.ok).length;
  const pct = results.length ? Math.round(ok / results.length * 100) : 0;
  const wrong = results.filter(r => !r.ok);
  add(el, 
    h('div', { class: 'end' },
      h('p', { class: 'end-score' }, h('b', {}, `${ok} von ${results.length}`), ' richtig, das sind ', h('b', {}, `${pct} %`), '.'),
      h('h2', {}, pct >= 90 ? 'Das sitzt.' : pct >= 70 ? 'Gut gemacht.' : pct >= 50 ? 'Die Grundlage ist da.' : 'Hier lohnt sich Üben.'),
      h('p', { class: 'muted' }, cfg.endNote || 'Richtig beantwortete Fragen legt Lernstack dir in größer werdenden Abständen wieder vor, falsch beantwortete schon morgen.'),
      h('div', { class: 'row center' },
        wrong.length ? h('button', { class: 'btn btn-primary', onclick: () => runItems(el, wrong.map(r => r.item), { ...cfg, title: 'Fehler wiederholen', intro: null, endNote: null }) }, wrong.length === 1 ? 'Den Fehler wiederholen' : `Die ${wrong.length} Fehler wiederholen`) : null,
        cfg.again ? h('button', { class: 'btn', onclick: cfg.again }, 'Neue Runde') : null,
        cfg.backHref ? h('a', { class: 'btn btn-ghost', href: cfg.backHref }, 'Zurück') : null,
      ),
      wrong.length ? reviewList(wrong) : null,
    ),
  );
}

export function reviewList(rs) {
  return h('div', { class: 'review' },
    h('h3', {}, 'Lösungen zum Nachlesen'),
    rs.map(r => h('details', { class: `rev ${r.ok ? 'ok' : 'bad'}` },
      h('summary', { html: `<span class="mark">${r.ok ? 'richtig' : 'falsch'}</span> ` + r.item.q.replace(/<(?!\/?(b|sup|sub|span)[ >])[^>]+>/g, '') }),
      h('div', { class: 'rev-body' },
        h('p', {}, 'Deine Antwort: ', h('span', { class: 'mono', html: String(r.given ?? '–') })),
        r.item.explain ? h('div', { html: r.item.explain }) : null,
      ),
    )),
  );
}
