import { h, add, clear, clearKeys, clearTimers, confetti, toast } from './ui.js';
import * as store from './store.js';
import { subjects, byId } from '../content/subjects.js';
import { runItems, reviewList } from './engines/runner.js';
import { quizRound, caseItems, examItems, diagItems, tKey, genRegistry } from './engines/pool.js';
import { playMatch, playOrder, playFlash } from './engines/games.js';
import { arcadeMenu, playArcade } from './engines/arcade.js';
import { journeyMenu, playJourney } from './engines/journey.js';

const app = document.getElementById('app');
const hud = document.getElementById('hud');

// ---------- Kopfzeile: Stufe und Punkte ----------
function drawHud() {
  const L = store.levelInfo();
  const days = store.streak();
  clear(hud).append(
    h('a', { class: 'hud', href: '#/profil', title: `Noch ${L.toNext} Punkte bis Stufe ${L.level + 1}` },
      h('span', { class: 'hud-level' }, `Stufe ${L.level}`),
      h('span', { class: 'hud-title' }, L.title),
      h('span', { class: 'hud-bar', 'aria-hidden': 'true' }, h('i', { style: { width: (L.progress * 100) + '%' } })),
      h('span', { class: 'hud-points' }, `${store.get().xp} Punkte`),
      days > 1 ? h('span', { class: 'hud-days' }, `${days} Tage in Folge`) : null,
    ),
  );
}
store.onChange(e => {
  drawHud();
  if (e.type === 'xp' && e.levelUp) { confetti(70); toast(`Stufe ${e.level} erreicht: ${store.levelInfo().title}`, 'level', 3500); }
});

// ---------- Hilfen ----------
const pct = m => m == null ? 'noch nicht geübt' : `${Math.round(m * 100)} % richtig`;
function subjectMastery(s) {
  const ms = s.topics.map(t => store.mastery(tKey(s, t))).filter(x => x != null);
  return ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : null;
}
function grade(p) {
  if (p >= 92) return [1, 'sehr gut'];
  if (p >= 81) return [2, 'gut'];
  if (p >= 67) return [3, 'befriedigend'];
  if (p >= 50) return [4, 'ausreichend'];
  if (p >= 30) return [5, 'mangelhaft'];
  return [6, 'ungenügend'];
}
function notFound() {
  add(app, h('div', { class: 'page-head' }, h('h1', {}, 'Diese Seite gibt es nicht.'), h('p', {}, h('a', { href: '#/' }, 'Zur Startseite'))));
}
const crumb = (href, text) => h('a', { class: 'crumb', href }, text);

// Themenliste: jede Zeile mit Farbmarke, Titel, kurzer Beschreibung und Fortschritt.
// rows = [{ label, desc, value (0..1 oder null), note, href, color, off }]
const levelOf = v => v == null ? ['none', 'noch nicht geübt'] : v >= 0.85 ? ['ok', 'sitzt'] : v >= 0.5 ? ['mid', 'fast sicher'] : ['bad', 'üben'];
function topicList(rows, { label = 'Themen', legend = true } = {}) {
  return h('div', { class: 'tlist-wrap' },
    h('ul', { class: 'tlist', 'aria-label': label }, rows.map((r, i) => {
      const [lv, word] = levelOf(r.value);
      const segs = r.value == null ? 0 : Math.round(r.value * 10);
      const inner = [
        h('span', { class: 'tl-mark', 'aria-hidden': 'true' }),
        h('span', { class: 'tl-text' }, h('b', {}, r.label), r.desc ? h('span', {}, r.desc) : null),
        r.off ? h('span', { class: 'tl-soon' }, 'folgt')
          : h('span', { class: `tl-state lv-${lv}` },
            h('span', { class: 'meter', 'aria-hidden': 'true' }, Array.from({ length: 10 }, (_, k) => h('i', { class: k < segs ? 'on' : '' }))),
            h('span', { class: 'tl-word' }, r.value == null ? word : `${Math.round(r.value * 100)} %, ${word}`),
            r.note ? h('small', {}, r.note) : null),
      ];
      return h('li', { style: { '--c': r.color || 'var(--rule)', '--d': `${i * 40}ms` } },
        r.off ? h('div', { class: 'trow is-off' }, inner) : h('a', { class: 'trow', href: r.href }, inner));
    })),
    legend ? h('p', { class: 'tl-legend' }, 'Der Balken zeigt, wie viele deiner letzten Antworten zu einem Thema richtig waren. Ab 85 % gilt ein Thema als sicher.') : null,
  );
}

// ---------- Startseite ----------
function viewHome() {
  const s0 = subjects.find(s => s.status === 'aktiv');
  add(app, 
    h('section', { class: 'home-head' },
      h('h1', {}, 'Für die Klausur üben, in kurzen Runden.'),
      h('p', { class: 'lead' }, 'Lernstack ist die Übungsseite unserer FISI-Klasse. Statt seitenlang zu lesen, beantwortest du Fragen, rechnest auf Zeit, verfolgst Datenpakete durchs Netz oder schreibst eine Probeklausur. Nach jeder Antwort siehst du sofort, ob sie stimmt und warum.'),
      h('div', { class: 'row' },
        h('a', { class: 'btn btn-primary btn-lg', href: `#/f/${s0.id}/diagnose` }, 'Mit der Einstufung beginnen'),
        h('a', { class: 'btn btn-lg', href: `#/f/${s0.id}` }, `${s0.title} ansehen`),
      ),
    ),
    h('h2', { class: 'section' }, 'Fächer'),
    h('p', { class: 'section-intro' }, 'Weitere Fächer kommen mit den nächsten Klausuren dazu.'),
    topicList(subjects.map(s => {
      const on = s.status === 'aktiv';
      return { label: s.title, desc: on ? `${s.topics.length} Themen. ${s.desc}` : s.desc, value: on ? subjectMastery(s) : null, href: `#/f/${s.id}`, color: on ? 'var(--primary)' : null, off: !on };
    }), { label: 'Fächer', legend: false }),
    h('h2', { class: 'section' }, 'So lernst du hier am besten'),
    h('ol', { class: 'steps' },
      h('li', {}, h('b', {}, 'Einstufung machen.'), ' 30 Fragen aus allen Themen, das dauert etwa 15 Minuten. Danach siehst du, welche Themen schon sitzen und wo du ansetzen solltest.'),
      h('li', {}, h('b', {}, 'Die schwachen Themen üben.'), ' Lies die Lernseite des Themas und übe dann mit Quiz, Zuordnen oder Karteikarten. Rechenthemen trainierst du in der Rechen-Arcade.'),
      h('li', {}, h('b', {}, 'Eine Probeklausur schreiben.'), ' 25 gemischte Aufgaben in 45 Minuten. Am Ende bekommst du eine Note nach dem IHK-Schlüssel und alle Lösungen zum Nachlesen.'),
    ),
  );
}

// ---------- Fachseite ----------
function viewSubject(s) {
  const diag = store.getDiag(s.id);
  add(app, 
    h('div', { class: 'page-head' },
      crumb('#/', 'Alle Fächer'),
      h('h1', {}, s.title),
      h('p', { class: 'lead' }, 'Wähle ein Thema, um die Lernseite zu lesen und zu üben. Neben jedem Thema siehst du, wie sicher du darin schon bist.'),
    ),
    topicList(s.topics.map(t => ({ label: t.title, desc: t.blurb, value: store.mastery(tKey(s, t)), href: `#/f/${s.id}/t/${t.id}`, color: t.color }))),
    h('h2', { class: 'section' }, 'Übungen für das ganze Fach'),
    h('div', { class: 'modes' },
      mode(`#/f/${s.id}/diagnose`, 'Einstufung', '30 Fragen aus allen Themen. Danach siehst du auf einen Blick, welche Themen du noch üben solltest.', diag ? `Zuletzt gemacht am ${new Date(diag.date).toLocaleDateString('de-DE')}. ` : '', diag ? h('a', { href: `#/f/${s.id}/diagnose/ergebnis` }, 'Letztes Ergebnis ansehen') : null),
      mode(`#/f/${s.id}/arcade`, 'Rechen-Arcade', 'Subnetting, Zahlensysteme und andere Rechnungen auf Zeit. Bei Fehlern siehst du den vollständigen Rechenweg.'),
      mode(`#/f/${s.id}/reise`, 'Paketreise', 'Du begleitest ein Datenpaket durch ein Netz und entscheidest an jeder Station, was als Nächstes passiert.'),
      mode(`#/f/${s.id}/faelle`, 'Fehlersuche', `${s.cases.length} Fälle aus der Praxis: Etwas funktioniert nicht, und du findest heraus, warum.`),
      mode(`#/f/${s.id}/klausur`, 'Probeklausur', `${s.exam.count} Aufgaben in ${s.exam.minutes} Minuten, ohne Hilfe zwischendurch. Am Ende gibt es eine Note.`, '', null, true),
    ),
  );
}
function mode(href, title, text, extra = '', link = null, primary = false) {
  return h('div', { class: `mode ${primary ? 'mode-primary' : ''}` },
    h('div', {}, h('h3', {}, h('a', { href }, title)), h('p', {}, text, extra ? h('span', { class: 'muted' }, ' ' + extra) : null, link)),
    h('a', { class: `btn ${primary ? 'btn-primary' : ''}`, href, 'aria-hidden': 'true', tabindex: '-1' }, 'Starten'),
  );
}

// ---------- Themenseite mit Lernseite ----------
function viewTopic(s, t) {
  const base = `#/f/${s.id}/t/${t.id}`;
  const st = store.topicStats(tKey(s, t));
  const m = store.mastery(tKey(s, t));
  const slug = x => x.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-');
  const actions = [
    ['quiz', 'Quiz', `10 Fragen${t.gens.length ? ', davon einige zum Rechnen' : ''}`, true],
    t.pairs?.length && ['zuordnen', 'Zuordnen', 'Begriffe und Bedeutungen zusammenbringen'],
    t.order?.length && ['reihenfolge', 'Reihenfolge', 'Schritte in die richtige Reihenfolge bringen'],
    t.cards?.length && ['karten', 'Karteikarten', `${t.cards.length} Karten zum Abfragen`],
    t.gens.length && ['rechnen', 'Rechnen', 'Rechenaufgaben ohne Zeitdruck'],
  ].filter(Boolean);
  add(app, 
    h('div', { class: 'topic-layout', style: { '--topic': t.color } },
      h('div', { class: 'topic-head' },
        crumb(`#/f/${s.id}`, s.title),
        h('h1', {}, t.title),
        h('p', { class: 'lead' }, t.blurb),
      ),
      h('article', { class: 'learn' },
        t.learn.map(sec => h('section', { id: slug(sec.h) }, h('h2', {}, sec.h), h('div', { class: 'prose', html: sec.html }))),
        h('div', { class: 'learn-end' },
          h('p', {}, 'Fertig gelesen? Dann prüf, was hängen geblieben ist.'),
          h('a', { class: 'btn btn-primary', href: `${base}/quiz` }, 'Quiz starten'),
        ),
      ),
      h('aside', { class: 'topic-aside' },
        h('div', { class: 'aside-box' },
          h('h2', {}, 'Üben'),
          h('p', { class: 'small muted' }, st.total ? `Du hast ${st.total} Fragen zu diesem Thema beantwortet, zuletzt ${pct(m)}.` : 'Du hast dieses Thema noch nicht geübt.'),
          h('ul', { class: 'action-list' }, actions.map(([id, title, text, primary]) => h('li', {},
            h('a', { class: primary ? 'primary' : '', href: `${base}/${id}` }, h('b', {}, title), h('span', {}, text))))),
        ),
        h('nav', { class: 'aside-box toc', 'aria-label': 'Inhalt der Lernseite' },
          h('h2', {}, 'Auf dieser Seite'),
          h('ul', {}, t.learn.map(sec => h('li', {}, h('a', { href: '#', onclick: e => { e.preventDefault(); document.getElementById(slug(sec.h))?.scrollIntoView({ behavior: 'smooth' }); } }, sec.h)))),
        ),
      ),
    ),
  );
}

// ---------- Einstufung ----------
function viewDiagnose(s) {
  const items = diagItems(s).sort(() => Math.random() - 0.5);
  runItems(app, items, {
    title: `Einstufung ${s.title}`, xp: 8,
    intro: 'Beantworte die Fragen so gut du kannst. Raten ist erlaubt, aber ehrlich bleiben hilft dir mehr. Nur zwei der 30 Aufgaben sind Rechenaufgaben.',
    onFinish(results, el) {
      const res = {};
      s.topics.forEach(t => {
        const rs = results.filter(r => r.item.diagTopic === t.id);
        res[t.id] = rs.length ? rs.filter(r => r.ok).length / rs.length : null;
      });
      store.saveDiag(s.id, res);
      diagResult(el, s, res, results);
    },
  });
}
function diagResult(el, s, res, results) {
  clear(el);
  const weak = s.topics.filter(t => res[t.id] != null && res[t.id] < 0.85).sort((a, b) => res[a.id] - res[b.id]).slice(0, 3);
  const total = results ? Math.round(results.filter(r => r.ok).length / results.length * 100) : null;
  add(el, 
    h('div', { class: 'page-head' },
      crumb(`#/f/${s.id}`, s.title),
      h('h1', {}, 'Dein Ergebnis'),
      total != null ? h('p', { class: 'lead' }, `Du hast ${total} % der Fragen richtig beantwortet. Darunter siehst du, wie es in den einzelnen Themen aussieht.`) : null,
    ),
    topicList(s.topics.map(t => ({ label: t.title, value: res[t.id], note: res[t.id] == null ? null : `${Math.round(res[t.id] * 3)} von 3 Fragen richtig`, href: `#/f/${s.id}/t/${t.id}`, color: t.color })), { label: 'Ergebnis der Einstufung', legend: false }),
    weak.length ? [
      h('h2', { class: 'section' }, 'Damit solltest du anfangen'),
      h('ol', { class: 'steps' }, weak.map(t => h('li', {}, h('a', { href: `#/f/${s.id}/t/${t.id}` }, h('b', {}, t.title)), ` Hier waren ${Math.round(res[t.id] * 100)} % deiner Antworten richtig. Lies die Lernseite und mach danach das Quiz.`))),
    ] : h('p', { class: 'callout' }, 'Alle Themen liegen bei 85 % oder mehr. Probier als Nächstes die Probeklausur.'),
    results ? reviewList(results.filter(r => !r.ok)) : null,
  );
}

// ---------- Probeklausur ----------
function viewExam(s) {
  clear(app);
  add(app, h('div', { class: 'page-head narrow' },
    crumb(`#/f/${s.id}`, s.title),
    h('h1', {}, 'Probeklausur'),
    h('p', { class: 'lead' }, `Du bekommst ${s.exam.count} Aufgaben aus allen Themen und hast ${s.exam.minutes} Minuten Zeit. Während der Klausur siehst du nicht, ob deine Antworten stimmen. Erst am Ende gibt es die Auswertung mit Note und allen Lösungen.`),
    h('h2', { class: 'section' }, 'Gut zu wissen'),
    h('ul', { class: 'prose-list' },
      h('li', {}, 'Bei Rechenaufgaben trägst du nur das Ergebnis ein. IP-Adressen schreibst du mit Punkten, Kommazahlen mit Komma.'),
      h('li', {}, 'Wenn mehrere Antworten richtig sind, gibt es den Punkt nur, wenn du alle richtigen und keine falsche auswählst.'),
      h('li', {}, 'Die Note richtet sich nach dem IHK-Schlüssel: ab 92 % eine 1, ab 81 % eine 2, ab 67 % eine 3, ab 50 % eine 4 und ab 30 % eine 5.'),
    ),
    h('button', { class: 'btn btn-primary btn-lg', onclick: startExam }, 'Probeklausur starten'),
  ));
  function startExam() {
    const items = examItems(s, s.exam.count);
    runItems(app, items, {
      title: 'Probeklausur', exam: true, minutes: s.exam.minutes, xp: 12,
      onFinish(results, el, meta) {
        clear(el);
        const ok = results.filter(r => r.ok).length;
        const p = Math.round(ok / items.length * 100);
        const [g, gt] = grade(p);
        if (g <= 2) confetti(90);
        const open = items.length - results.length;
        add(el, h('div', { class: 'end' },
          h('div', { class: `grade grade-${g}` }, h('span', {}, 'Note'), h('b', {}, g)),
          h('h2', {}, gt[0].toUpperCase() + gt.slice(1) + '.'),
          h('p', { class: 'muted' }, `${ok} von ${items.length} Punkten, das sind ${p} %. Du hast ${Math.max(1, Math.round(meta.seconds / 60))} Minuten gebraucht.${open ? ` ${open} Aufgaben hast du nicht mehr geschafft.` : ''}`),
          h('div', { class: 'row center' },
            h('button', { class: 'btn btn-primary', onclick: startExam }, 'Neue Probeklausur'),
            h('a', { class: 'btn', href: `#/f/${s.id}` }, 'Zurück zum Fach')),
          reviewList([...results.filter(r => !r.ok), ...results.filter(r => r.ok)]),
        ));
      },
    });
  }
}

// ---------- Fortschritt ----------
function viewProfile() {
  const L = store.levelInfo();
  add(app, 
    h('div', { class: 'page-head' },
      crumb('#/', 'Startseite'),
      h('h1', {}, 'Dein Fortschritt'),
      h('p', { class: 'lead' }, `Du bist auf Stufe ${L.level} („${L.title}“) und hast ${store.get().xp} Punkte. Bis zur nächsten Stufe fehlen dir noch ${L.toNext} Punkte.`),
      h('p', { class: 'small muted' }, 'Dein Fortschritt wird nur in diesem Browser gespeichert. Es gibt kein Konto und keinen Server, der deine Antworten kennt. Wenn du an einem anderen Rechner weitermachen willst, exportiere deinen Stand hier und importiere ihn dort.'),
    ),
    subjects.filter(s => s.status === 'aktiv').map(s => [
      h('h2', { class: 'section' }, s.title),
      topicList(s.topics.map(t => {
        const st = store.topicStats(tKey(s, t));
        return { label: t.title, value: store.mastery(tKey(s, t)), note: st.total ? `${st.total} Antworten insgesamt` : null, href: `#/f/${s.id}/t/${t.id}`, color: t.color };
      })),
      h('p', { class: 'small muted' }, `Deine Rekorde in der Rechen-Arcade: Zahlensysteme ${store.getBest('arcade:zahlen')}, Subnetting ${store.getBest('arcade:subnet')}, weitere Rechnungen ${store.getBest('arcade:sonst')}, gemischt ${store.getBest('arcade:mix')} Punkte.`),
    ]),
    h('h2', { class: 'section' }, 'Deine Daten'),
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: async () => { const d = store.exportData(); try { await navigator.clipboard.writeText(d); toast('Dein Stand ist in der Zwischenablage. Füge ihn am anderen Rechner unter Importieren ein.'); } catch { prompt('Diesen Text kopieren:', d); } } }, 'Stand exportieren'),
      h('button', { class: 'btn', onclick: () => { const d = prompt('Füge hier deinen exportierten Stand ein:'); if (d) { try { store.importData(d); toast('Dein Stand wurde übernommen.'); route(); } catch { toast('Das hat nicht geklappt. Der eingefügte Text ist kein gültiger Stand.', 'warn'); } } } }, 'Stand importieren'),
      h('button', { class: 'btn btn-quiet-bad', onclick: () => { if (confirm('Willst du deinen gesamten Fortschritt löschen? Das lässt sich nicht rückgängig machen.')) { store.reset(); route(); } } }, 'Fortschritt löschen'),
    ),
  );
}

// ---------- Router ----------
function route() {
  clearKeys(); clearTimers();
  clear(app);
  window.scrollTo(0, 0);
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  document.body.dataset.view = parts[0] || 'home';
  if (!parts.length) return viewHome();
  if (parts[0] === 'profil') return viewProfile();
  if (parts[0] !== 'f') return notFound();
  const s = byId[parts[1]];
  if (!s || s.status !== 'aktiv') return notFound();
  const sub = parts[2];
  if (!sub) return viewSubject(s);
  if (sub === 'diagnose') {
    if (parts[3] === 'ergebnis' && store.getDiag(s.id)) return diagResult(app, s, store.getDiag(s.id).result);
    return viewDiagnose(s);
  }
  if (sub === 'klausur') return viewExam(s);
  if (sub === 'arcade') return arcadeMenu(app, s);
  if (sub === 'faelle') return runItems(app, caseItems(s).sort(() => Math.random() - 0.5), { title: 'Fehlersuche', xp: 15, backHref: `#/f/${s.id}`, again: () => route(), intro: 'Jeder Fall beschreibt ein Problem aus dem Alltag. Lies die Beschreibung und die Ausgabe genau und entscheide, woran es liegt.' });
  if (sub === 'reise') {
    const j = s.journeys.find(x => x.id === parts[3]);
    return j ? playJourney(app, s, j) : journeyMenu(app, s);
  }
  if (sub === 't') {
    const t = s.topics.find(x => x.id === parts[3]);
    if (!t) return notFound();
    const back = `#/f/${s.id}/t/${t.id}`;
    const act = parts[4];
    document.documentElement.style.setProperty('--topic', t.color);
    if (!act) return viewTopic(s, t);
    if (act === 'quiz') return runItems(app, quizRound(s, t, 10), { title: `Quiz: ${t.title}`, backHref: back, again: () => route() });
    if (act === 'zuordnen') {
      let k = 0; const go = () => playMatch(app, t.pairs[k % t.pairs.length], { topicKey: tKey(s, t), backHref: back, next: t.pairs.length > 1 ? () => { k++; go(); } : null }); return go();
    }
    if (act === 'reihenfolge') {
      let k = 0; const go = () => playOrder(app, t.order[k % t.order.length], { topicKey: tKey(s, t), backHref: back, next: t.order.length > 1 ? () => { k++; go(); } : null }); return go();
    }
    if (act === 'karten') return playFlash(app, t.cards, { topicKey: tKey(s, t), backHref: back });
    if (act === 'rechnen') return playArcade(app, s, { id: 't:' + t.id, title: t.title, gens: t.gens.map(g => genRegistry[g]) }, { sprint: false });
  }
  notFound();
}

// Hell/Dunkel umschalten, Wahl im Browser merken
const tbtn = document.getElementById('theme-toggle');
function syncTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  tbtn.setAttribute('aria-pressed', String(dark));
  tbtn.querySelector('.tt-label').textContent = dark ? 'Hell' : 'Dunkel';
  tbtn.title = dark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln';
}
tbtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('lernstack.theme', next); } catch { /* kein Speicher */ }
  syncTheme();
});
syncTheme();

window.addEventListener('hashchange', route);
drawHud();
route();
