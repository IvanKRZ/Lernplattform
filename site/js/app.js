import { h, add, clear, clearKeys, clearTimers, toast, dialog, inkOn, pick } from './ui.js';
import * as store from './store.js';
import * as account from './account.js';
import { subjects, byId } from '../content/subjects.js';
import { runItems, reviewList } from './engines/runner.js';
import { renderItem, fromGen } from './engines/item.js';
import { quizRound, caseItems, examItems, diagItems, dailyItems, dueItems, coverage, tKey, genRegistry } from './engines/pool.js';
import { playMatch, playOrder } from './engines/games.js';
import { arcadeMenu, playArcade } from './engines/arcade.js';
import { journeyMenu, playJourney } from './engines/journey.js';
import { viewLogin, viewRegister, viewAccount, viewForcedPassword } from './views/account.js';
import { viewAdmin } from './views/admin.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');
const side = document.getElementById('side');
const S = subjects.find(s => s.status === 'aktiv');   // Zurzeit gibt es genau ein Fach.

// ---------- Kopfzeile ----------
function drawChrome() {
  const here = location.hash.replace(/^#\/?/, '').split('/')[0] || '';
  const u = account.current();
  const link = (href, text, on) => h('a', { href, 'aria-current': on ? 'page' : null }, text);
  clear(nav).append(
    link('#/', 'Heute', here === ''),
    link(`#/f/${S.id}`, 'Themen', here === 'f'),
    link('#/profil', 'Fortschritt', here === 'profil'),
    ...(account.isAdmin() ? [link('#/verwaltung', 'Verwaltung', here === 'verwaltung')] : []),
  );
  const L = store.levelInfo();
  clear(side).append(...[
    store.syncStatus() === 'offline' ? h('span', { class: 'sync-warn', title: 'Deine Antworten sind in diesem Browser gesichert und werden nachgetragen, sobald der Server wieder erreichbar ist.' }, 'Nicht gespeichert') : null,
    u ? h('a', { class: 'who', href: '#/konto', 'aria-current': here === 'konto' ? 'page' : null, title: `Stufe ${L.level}, ${L.title}. Zum Konto.` }, h('b', {}, u.name), h('span', {}, `Stufe ${L.level}`))
      : account.isAvailable() ? h('a', { class: 'who who-guest', href: '#/anmelden', 'aria-current': here === 'anmelden' || here === 'registrieren' ? 'page' : null }, 'Anmelden') : null,
  ].filter(Boolean));
}
store.onChange(e => {
  if (e.type === 'xp' && e.levelUp) toast(`Stufe ${e.level} erreicht: ${store.levelInfo().title}`, 'level', 3500);
  if (e.type === 'signed-out') { account.leave(); toast('Deine Sitzung ist abgelaufen. Melde dich wieder an, damit dein Fortschritt gespeichert wird.', 'warn', 6000); }
  if (e.type === 'reset' && e.reason === 'conflict') { toast('Auf einem anderen Gerät wurde weitergelernt. Der neuere Stand wurde geladen.', 'info', 5000); route(); }
  if (e.type === 'reset' && e.reason === 'refresh' && isOverview()) route();
  if (e.type !== 'answer') drawChrome();
});
account.onChange(() => drawChrome());
// Seiten, die man gefahrlos neu zeichnen kann (keine laufende Aufgabe)
const isOverview = () => /^#?\/?(profil|f\/[^/]+)?$/.test(location.hash);

// ---------- Hilfen ----------
function grade(p) {
  if (p >= 92) return [1, 'sehr gut'];
  if (p >= 81) return [2, 'gut'];
  if (p >= 67) return [3, 'befriedigend'];
  if (p >= 50) return [4, 'ausreichend'];
  if (p >= 30) return [5, 'mangelhaft'];
  return [6, 'ungenügend'];
}
function notFound() {
  add(app, h('div', { class: 'page-head' }, h('h1', {}, 'Diese Seite gibt es nicht.'), h('p', { class: 'lead' }, h('a', { href: '#/' }, 'Zur Startseite'))));
}
const crumb = (href, text) => h('a', { class: 'crumb', href }, text);
const topicNo = t => S.topics.indexOf(t) + 1;
const tab = (t, extra = '') => h('span', { class: `tab ${extra}`, style: { '--c': t.color, '--on': inkOn(t.color) }, 'aria-hidden': 'true' }, topicNo(t));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Abschnitt mit Überschrift in der Randspalte, Inhalt daneben
function sec(title, note, ...content) {
  return h('section', { class: 'sec' },
    h('div', { class: 'sec-head' }, h('h2', {}, title), note ? h('p', {}, note) : null),
    h('div', { class: 'sec-body' }, content),
  );
}

// Inhaltsverzeichnis: eine Zeile pro Thema mit Kapitelnummer, Titel und Stand.
const levelOf = v => v == null ? ['none', 'noch nicht geübt'] : v >= 0.85 ? ['ok', 'sitzt'] : v >= 0.5 ? ['mid', 'fast sicher'] : ['bad', 'üben'];
function meter(value) {
  const [lv, word] = levelOf(value);
  const segs = value == null ? 0 : Math.round(value * 10);
  return h('span', { class: `state lv-${lv}` },
    h('span', { class: 'meter', 'aria-hidden': 'true' }, Array.from({ length: 10 }, (_, k) => h('i', { class: k < segs ? 'on' : '' }))),
    h('span', { class: 'state-word' }, value == null ? word : `${Math.round(value * 100)} %, ${word}`));
}
function tocList(topics, { desc = true, note = topicNote, value = t => store.mastery(tKey(S, t)) } = {}) {
  return h('ol', { class: `toc-list${desc ? '' : ' is-compact'}` }, topics.map(t => h('li', {},
    h('a', { class: 'toc-row', href: `#/f/${S.id}/t/${t.id}` },
      tab(t),
      h('span', { class: 'toc-text' }, h('b', {}, t.title), desc ? h('span', {}, t.blurb) : null),
      h('span', { class: 'toc-state' }, meter(value(t)), note ? h('small', {}, note(t)) : null),
    ))));
}
function topicNote(t) {
  const c = coverage(S, t);
  if (!c.seen) return `${c.total} Fragen`;
  return `${c.seen} von ${c.total} Fragen gesehen${c.due ? `, ${c.due} fällig` : ''}`;
}
const LEGEND = 'Der Balken zeigt den Anteil richtiger Antworten unter deinen letzten 25 zu diesem Thema. Ab 85 % gilt ein Thema als sicher.';

// Übungsformen, die quer durch alle Themen gehen
function modeList() {
  const diag = store.getDiag(S.id);
  const examBest = store.getBest(`exam:${S.id}`);
  const arcadeBest = Math.max(...['zahlen', 'subnet', 'sonst', 'mix'].map(k => store.getBest(`arcade:${k}`)));
  const due = dueItems(S).length;
  const rows = [
    [`#/f/${S.id}/runde`, 'Tagesrunde', 'Fällige Wiederholungen aus allen Themen, dazu ein paar neue Fragen und zwei Rechenaufgaben. Etwa zehn Minuten.', due ? `${plural(due, 'Frage', 'Fragen')} fällig` : 'nichts fällig'],
    [`#/f/${S.id}/klausur`, 'Probeklausur', `${S.exam.count} Aufgaben in ${S.exam.minutes} Minuten, ohne Rückmeldung zwischendurch. Am Ende steht eine Note nach dem IHK-Schlüssel.`, examBest ? `bestes Ergebnis ${examBest} %` : 'noch nicht geschrieben'],
    [`#/f/${S.id}/arcade`, 'Rechentraining', 'Subnetting, Zahlensysteme und weitere Rechnungen, wahlweise auf Zeit. Bei einem Fehler siehst du den vollständigen Rechenweg.', arcadeBest ? `Rekord ${arcadeBest} Punkte` : 'noch kein Rekord'],
    [`#/f/${S.id}/reise`, 'Paketreise', 'Du verfolgst ein Paket Hop für Hop durchs Netz und entscheidest an jeder Station, was mit MAC-Adressen, IP-Adressen und Ports passiert.', plural(S.journeys.length, 'Strecke', 'Strecken')],
    [`#/f/${S.id}/faelle`, 'Fehlersuche', 'Störungsmeldungen mit Befehlsausgaben wie ipconfig oder ping. Du grenzt die Ursache ein, wie im Support.', plural(S.cases.length, 'Fall', 'Fälle')],
    [`#/f/${S.id}/diagnose`, 'Einstufung', '30 Fragen, drei aus jedem Thema. Das Ergebnis zeigt, welche Themen schon sitzen und wo du ansetzen solltest.', diag ? `zuletzt ${diagAvg(diag)} % richtig` : 'noch nicht gemacht'],
  ];
  return h('ul', { class: 'modes' }, rows.map(([href, title, text, stat]) => h('li', {},
    h('a', { href }, h('b', {}, title), h('span', { class: 'modes-text' }, text), h('span', { class: 'modes-stat' }, stat)))));
}
function diagAvg(d) {
  const v = Object.values(d.result || {}).filter(x => typeof x === 'number');
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100) : 0;
}

// Die letzten 14 Tage als Reihe von Kästchen
function week() {
  const days = store.activity(14);
  const streak = store.streak();
  const sum = days.slice(-7).reduce((a, d) => a + d.count, 0);
  return h('div', { class: 'week' },
    h('ol', { class: 'week-days', 'aria-label': 'Antworten an den letzten 14 Tagen' }, days.map((d, i) => h('li', {
      class: d.count >= 10 ? 'd2' : d.count ? 'd1' : '', 'data-today': i === days.length - 1 ? 'true' : null,
      title: `${d.date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}: ${plural(d.count, 'Antwort', 'Antworten')}`,
    }, h('span', { 'aria-hidden': 'true' }, d.date.toLocaleDateString('de-DE', { weekday: 'short' }).slice(0, 2)), h('i', {}, d.count || '')))),
    h('p', {}, streak > 1 ? `${streak} Tage in Folge gelernt. ` : '', sum ? `${plural(sum, 'Antwort', 'Antworten')} in den letzten sieben Tagen.` : 'In den letzten sieben Tagen hast du noch nichts beantwortet.'),
  );
}

// ---------- Startseite ohne Lernstand: zeigt, was Lernstack ist, mit einer echten Aufgabe ----------
function viewLanding() {
  const demo = h('div', { class: 'demo-stage' });
  const demoGens = ['hosts', 'netid', 'cidr2mask', 'bin2dec', 'broadcast'].map(id => genRegistry[id]).filter(Boolean);
  // Die erste Aufgabe zieht den Fokus nicht an sich, sonst springt auf dem Handy sofort die Tastatur auf.
  function nextDemo(focus = true) {
    const g = pick(demoGens);
    clear(demo).append(renderItem(fromGen(g, g.make(1), `${S.id}/${g.topic}`), { label: g.title, focus, onNext: () => nextDemo() }));
  }
  nextDemo(false);
  const canRegister = account.isAvailable() && account.registrationMode() !== 'closed';
  add(app,
    h('section', { class: 'landing' },
      h('div', { class: 'landing-text' },
        h('h1', {}, 'Netzwerktechnik lernen, bis es in der Prüfung sitzt.'),
        h('p', { class: 'lead' }, 'Lernstack ist eine Lernplattform für Fachinformatikerinnen und Fachinformatiker in Ausbildung und Umschulung. Du arbeitest zehn Themen von Zahlensystemen bis VPN durch, beantwortest Fragen dazu und bekommst jede Frage wieder vorgelegt, kurz bevor du sie vergessen würdest.'),
        h('div', { class: 'row' },
          canRegister ? h('a', { class: 'btn btn-primary btn-lg', href: '#/registrieren' }, 'Konto anlegen') : null,
          h('a', { class: `btn btn-lg${canRegister ? '' : ' btn-primary'}`, href: `#/f/${S.id}/diagnose` }, 'Ohne Konto mit der Einstufung starten'),
        ),
        account.isAvailable() ? h('p', { class: 'small muted' }, 'Mit Konto wird dein Lernstand gespeichert und ist auf jedem Gerät derselbe. Ohne Konto bleibt er nur in diesem Browser. ', h('a', { href: '#/anmelden' }, 'Du hast schon ein Konto? Anmelden')) : null,
      ),
      h('div', { class: 'demo' },
        h('p', { class: 'demo-cap' }, 'Eine Aufgabe zum Ausprobieren, direkt hier:'),
        demo,
      ),
    ),
    sec('So arbeitest du mit Lernstack', null,
      h('ol', { class: 'steps' },
        h('li', {}, h('b', {}, 'Einstufung.'), ' 30 Fragen aus allen Themen, etwa 15 Minuten. Danach siehst du pro Thema, was schon sitzt und wo Lücken sind.'),
        h('li', {}, h('b', {}, 'Tagesrunde.'), ' Jeden Tag etwa zehn Minuten: neue Fragen und Wiederholungen. Richtig beantwortete Fragen kommen nach 1, 3, 7, 14 und 30 Tagen wieder, falsch beantwortete schon am nächsten Tag.'),
        h('li', {}, h('b', {}, 'Probeklausur.'), ` ${S.exam.count} gemischte Aufgaben in ${S.exam.minutes} Minuten, benotet nach dem IHK-Schlüssel, mit allen Lösungen und Rechenwegen zum Nachlesen.`),
      )),
    sec('Inhalt', `${S.topics.length} Themen aus der Netzwerktechnik, jeweils mit Lernseite, Fragen und Übungen.`, tocList(S.topics, { note: t => `${t.questions.length} Fragen${t.gens.length ? ' und Rechenaufgaben' : ''}`, value: () => null })),
    sec('Übungsformen', 'Neben den Fragen zu jedem Thema gibt es Übungen quer durch das Fach.', modeList()),
  );
  app.querySelectorAll('.landing ~ .sec .state').forEach(e => e.remove());
}

// ---------- Startseite mit Lernstand: was heute zu tun ist ----------
function viewToday() {
  const u = account.current();
  const due = dueItems(S).length;
  const answers = store.totalAnswers();
  const today = store.activity(1)[0].count;
  const plan = dailyItems(S);
  const daily = `#/f/${S.id}/runde`;
  let title, lead, buttons;
  if (!answers && !store.getDiag(S.id)) {
    title = 'Fang mit der Einstufung an.';
    lead = '30 Fragen, drei aus jedem der zehn Themen, etwa 15 Minuten. Danach weißt du, wo du stehst, und Lernstack legt dir die Fragen ab morgen zur Wiederholung vor.';
    buttons = [h('a', { class: 'btn btn-primary btn-lg', href: `#/f/${S.id}/diagnose` }, 'Einstufung starten'), h('a', { class: 'btn btn-lg', href: `#/f/${S.id}/t/${S.topics[0].id}` }, `Lieber mit Thema 1 beginnen`)];
  } else if (due) {
    title = due === 1 ? 'Heute steht eine Wiederholung an.' : `Heute stehen ${due} Wiederholungen an.`;
    lead = `Die Tagesrunde hat ${plan.items.length} Aufgaben: ${plural(plan.due, 'fällige Frage', 'fällige Fragen')}${plan.fresh ? `, ${plural(plan.fresh, 'neue', 'neue')}` : ''} und ${plural(plan.calc, 'Rechenaufgabe', 'Rechenaufgaben')}. ${due > plan.due ? 'Der Rest folgt in der nächsten Runde.' : 'Danach ist für heute alles wiederholt.'}`;
    buttons = [h('a', { class: 'btn btn-primary btn-lg', href: daily }, 'Tagesrunde starten')];
  } else if (today) {
    title = 'Für heute ist alles wiederholt.';
    lead = plan.fresh ? 'Die nächsten Wiederholungen sind frühestens morgen fällig. Wenn du weitermachen willst, nimm neue Fragen dazu oder schreib eine Probeklausur.' : 'Du hast alle Fragen mindestens einmal gesehen. Die nächsten Wiederholungen sind frühestens morgen fällig. Eine Probeklausur zeigt dir, wo du insgesamt stehst.';
    buttons = [plan.fresh ? h('a', { class: 'btn btn-primary btn-lg', href: daily }, 'Runde mit neuen Fragen') : null, h('a', { class: `btn btn-lg${plan.fresh ? '' : ' btn-primary'}`, href: `#/f/${S.id}/klausur` }, 'Probeklausur schreiben')];
  } else {
    title = 'Heute ist nichts zur Wiederholung fällig.';
    lead = plan.fresh ? `Die Tagesrunde bringt dir ${plural(plan.fresh, 'neue Frage', 'neue Fragen')} und ${plural(plan.calc, 'Rechenaufgabe', 'Rechenaufgaben')}.` : 'Du hast alle Fragen mindestens einmal gesehen. Halte dich mit Rechenaufgaben oder einer Probeklausur in Übung.';
    buttons = [h('a', { class: 'btn btn-primary btn-lg', href: plan.fresh ? daily : `#/f/${S.id}/klausur` }, plan.fresh ? 'Tagesrunde starten' : 'Probeklausur schreiben')];
  }

  // Empfehlungen: die schwächsten geübten Themen, dann das nächste noch nicht begonnene
  const rated = S.topics.map(t => ({ t, m: store.mastery(tKey(S, t)), c: coverage(S, t) }));
  const weak = rated.filter(x => x.m != null && x.m < 0.85).sort((a, b) => a.m - b.m).slice(0, 2)
    .map(x => ({ t: x.t, text: `${Math.round(x.m * 100)} % deiner letzten Antworten waren richtig. Lies die Lernseite noch einmal und mach danach das Quiz.` }));
  const fresh = rated.filter(x => !x.c.seen).slice(0, weak.length ? 1 : 2)
    .map(x => ({ t: x.t, text: `Noch nicht begonnen. ${x.t.blurb}` }));
  const nextUp = [...weak, ...fresh];

  add(app,
    !u && account.isAvailable() ? h('p', { class: 'note' }, 'Du lernst gerade ohne Konto, dein Stand liegt nur in diesem Browser. ', h('a', { href: '#/registrieren' }, 'Leg ein Konto an'), ', dann wird er übernommen und ist auf jedem Gerät verfügbar.') : null,
    h('section', { class: 'today' },
      h('div', { class: 'today-main' },
        h('h1', {}, title),
        h('p', { class: 'lead' }, lead),
        h('div', { class: 'row' }, buttons),
      ),
      week(),
    ),
    nextUp.length ? sec('Als Nächstes', 'Vorschläge aus deinem Lernstand.',
      h('ul', { class: 'next' }, nextUp.map(({ t, text }) => h('li', {}, h('a', { href: `#/f/${S.id}/t/${t.id}` }, tab(t), h('span', {}, h('b', {}, t.title), h('span', {}, text))))))) : null,
    sec('Stand je Thema', LEGEND, tocList(S.topics, { desc: false })),
    sec('Übungsformen', 'Quer durch alle Themen.', modeList()),
  );
}

// ---------- Fachseite ----------
function viewSubject(s) {
  const diag = store.getDiag(s.id);
  add(app,
    h('div', { class: 'page-head' },
      h('h1', {}, s.title),
      h('p', { class: 'lead' }, 'Zehn Themen, die aufeinander aufbauen. Jedes hat eine Lernseite mit Beispielen und Rechenwegen, dazu Fragen, Zuordnungs- und Rechenaufgaben. Am Stand rechts siehst du, was sitzt.'),
    ),
    sec('Themen', LEGEND, tocList(s.topics),
      diag ? h('p', { class: 'small muted' }, h('a', { href: `#/f/${s.id}/diagnose/ergebnis` }, 'Letztes Ergebnis der Einstufung ansehen')) : null),
    sec('Übungsformen', 'Diese Übungen mischen Aufgaben aus allen Themen.', modeList()),
  );
}

// ---------- Themenseite mit Lernseite ----------
// Griffregister wie am Rand eines Tabellenbuchs: ein farbiger Reiter pro Thema
function register(s, current) {
  return h('nav', { class: 'reg', 'aria-label': 'Themen' }, s.topics.map(t => h('a', {
    href: `#/f/${s.id}/t/${t.id}`, style: { '--c': t.color, '--on': inkOn(t.color) },
    'aria-current': t === current ? 'page' : null, title: t.title,
  }, h('b', {}, topicNo(t)), h('span', {}, t.title))));
}
function viewTopic(s, t) {
  const base = `#/f/${s.id}/t/${t.id}`;
  const no = topicNo(t);
  const st = store.topicStats(tKey(s, t));
  const m = store.mastery(tKey(s, t));
  const c = coverage(s, t);
  const slug = x => 'a-' + x.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-');
  const jump = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const actions = [
    ['quiz', 'Quiz', `10 Fragen${t.gens.length ? ', einige davon zum Rechnen' : ''}. Fällige und neue Fragen kommen zuerst.`],
    t.pairs?.length && ['zuordnen', 'Zuordnen', 'Begriffe und Bedeutungen zusammenbringen'],
    t.order?.length && ['reihenfolge', 'Reihenfolge', 'Schritte in die richtige Reihenfolge bringen'],
    t.gens.length && ['rechnen', 'Rechnen', 'Rechenaufgaben ohne Zeitdruck, mit Rechenweg'],
  ].filter(Boolean);
  const prev = s.topics[no - 2], next = s.topics[no];
  add(app,
    register(s, t),
    h('div', { class: 'topic', style: { '--topic': t.color, '--on': inkOn(t.color) } },
      h('header', { class: 'topic-head' },
        crumb(`#/f/${s.id}`, 'Alle Themen'),
        h('h1', {}, h('span', { class: 'chap' }, no), t.title),
        h('p', { class: 'lead' }, t.blurb),
      ),
      h('article', { class: 'learn' },
        t.learn.map((part, i) => h('section', { id: slug(part.h) }, h('h2', {}, h('span', { class: 'sec-no' }, `${no}.${i + 1}`), part.h), h('div', { class: 'prose', html: part.html }))),
        h('div', { class: 'learn-end' },
          h('p', {}, 'Lesen allein reicht nicht. Was du abrufen kannst, zeigt das Quiz.'),
          h('a', { class: 'btn btn-primary', href: `${base}/quiz` }, 'Quiz zu diesem Thema starten'),
        ),
        h('nav', { class: 'pager', 'aria-label': 'Benachbarte Themen' },
          prev ? h('a', { href: `#/f/${s.id}/t/${prev.id}` }, h('small', {}, `Thema ${no - 1}`), prev.title) : h('span'),
          next ? h('a', { class: 'pager-next', href: `#/f/${s.id}/t/${next.id}` }, h('small', {}, `Thema ${no + 1}`), next.title) : null,
        ),
      ),
      h('aside', { class: 'margin' },
        h('div', { class: 'margin-box' },
          h('h2', {}, 'Üben'),
          h('ul', { class: 'action-list' }, actions.map(([id, title, text], i) => h('li', {},
            h('a', { class: i ? '' : 'primary', href: `${base}/${id}` }, h('b', {}, title), h('span', {}, text))))),
        ),
        h('div', { class: 'margin-box' },
          h('h2', {}, 'Dein Stand'),
          meter(m),
          h('p', { class: 'small' }, st.total
            ? `${c.seen} von ${c.total} Fragen gesehen, ${c.solid} davon gefestigt.${c.due ? ` ${plural(c.due, 'Frage ist', 'Fragen sind')} heute zur Wiederholung fällig.` : ''}`
            : `${c.total} Fragen warten auf dich.`),
        ),
        t.pruefung ? h('div', { class: 'margin-box' }, h('h2', {}, 'In der Prüfung'), h('p', { class: 'small' }, t.pruefung)) : null,
        h('nav', { class: 'margin-box onpage', 'aria-label': 'Inhalt der Lernseite' },
          h('h2', {}, 'Auf dieser Seite'),
          h('ol', {}, t.learn.map((part, i) => h('li', {}, h('a', { href: '#', onclick: jump(slug(part.h)) }, h('span', {}, `${no}.${i + 1}`), part.h)))),
        ),
      ),
    ),
  );
}

// ---------- Tagesrunde ----------
function viewDaily(s) {
  const plan = dailyItems(s);
  runItems(app, plan.items, {
    title: 'Tagesrunde', showTopic: true, backHref: '#/', again: () => route(),
    intro: plan.due ? `${plural(plan.due, 'Wiederholung', 'Wiederholungen')}${plan.fresh ? `, ${plural(plan.fresh, 'neue Frage', 'neue Fragen')}` : ''} und ${plural(plan.calc, 'Rechenaufgabe', 'Rechenaufgaben')}, gemischt aus allen Themen.`
      : `${plan.fresh ? `${plural(plan.fresh, 'neue Frage', 'neue Fragen')} und ` : ''}${plural(plan.calc, 'Rechenaufgabe', 'Rechenaufgaben')}. Heute ist nichts zur Wiederholung fällig.`,
  });
}

// ---------- Einstufung ----------
function viewDiagnose(s) {
  const items = diagItems(s).sort(() => Math.random() - 0.5);
  runItems(app, items, {
    title: 'Einstufung', xp: 8, backHref: `#/f/${s.id}`,
    intro: 'Beantworte die Fragen so gut du kannst. Wenn du etwas nicht weißt, rate nicht lange, sondern nimm die Antwort, die dir am plausibelsten erscheint. Nur zwei der 30 Aufgaben sind Rechenaufgaben.',
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
      crumb(`#/f/${s.id}`, 'Alle Themen'),
      h('h1', {}, 'Ergebnis der Einstufung'),
      total != null ? h('p', { class: 'lead' }, `${total} % der Fragen waren richtig. Die Fragen aus der Einstufung kommen in den nächsten Tagesrunden wieder: die falsch beantworteten morgen, die richtigen später.`) : null,
    ),
    sec('Je Thema', 'Drei Fragen pro Thema sind eine grobe Orientierung, keine Note.',
      tocList(s.topics, { desc: false, value: t => res[t.id], note: t => res[t.id] == null ? null : `${Math.round(res[t.id] * 3)} von 3 Fragen richtig` })),
    weak.length
      ? sec('Damit solltest du anfangen', null, h('ul', { class: 'next' }, weak.map(t => h('li', {}, h('a', { href: `#/f/${s.id}/t/${t.id}` }, tab(t), h('span', {}, h('b', {}, t.title), h('span', {}, `${Math.round(res[t.id] * 3)} von 3 Fragen richtig. Lies die Lernseite und mach danach das Quiz.`)))))))
      : h('p', { class: 'callout' }, 'Alle Themen liegen bei 85 % oder mehr. Probier als Nächstes die Probeklausur.'),
    results ? reviewList(results.filter(r => !r.ok)) : null,
    h('div', { class: 'row end-actions' }, h('a', { class: 'btn btn-primary', href: '#/' }, 'Zur Übersicht')),
  );
}

// ---------- Probeklausur ----------
function viewExam(s) {
  clear(app);
  add(app, h('div', { class: 'page-head' },
    crumb(`#/f/${s.id}`, 'Alle Themen'),
    h('h1', {}, 'Probeklausur'),
    h('p', { class: 'lead' }, `${s.exam.count} Aufgaben aus allen Themen, ${s.exam.minutes} Minuten Bearbeitungszeit. Während der Klausur erfährst du nicht, ob eine Antwort stimmt. Die Auswertung mit Note und allen Lösungen gibt es am Ende.`),
  ),
  sec('Hinweise zur Bearbeitung', null,
    h('ul', { class: 'prose-list' },
      h('li', {}, 'Bei Rechenaufgaben trägst du nur das Ergebnis ein. IP-Adressen schreibst du in Dezimalpunktschreibweise, Kommazahlen mit Komma.'),
      h('li', {}, 'Bei Mehrfachauswahl gibt es den Punkt nur, wenn du alle richtigen und keine falsche Antwort markierst.'),
      h('li', {}, 'Benotet wird nach dem IHK-Schlüssel: ab 92 % sehr gut, ab 81 % gut, ab 67 % befriedigend, ab 50 % ausreichend, ab 30 % mangelhaft.'),
      h('li', {}, 'Auch die Antworten aus der Klausur fließen in deine Wiederholungen ein.'),
    ),
    h('button', { class: 'btn btn-primary btn-lg', onclick: startExam }, 'Probeklausur starten')),
  );
  function startExam() {
    const items = examItems(s, s.exam.count);
    runItems(app, items, {
      title: 'Probeklausur', exam: true, minutes: s.exam.minutes, xp: 12, backHref: `#/f/${s.id}`,
      onFinish(results, el, meta) {
        clear(el);
        const ok = results.filter(r => r.ok).length;
        const p = Math.round(ok / items.length * 100);
        const [g, gt] = grade(p);
        store.setBest(`exam:${s.id}`, p);
        const open = items.length - results.length;
        add(el, h('div', { class: 'end' },
          h('div', { class: `grade grade-${g}` }, h('span', {}, 'Note'), h('b', {}, g), h('span', {}, gt)),
          h('p', { class: 'end-score' }, h('b', {}, `${ok} von ${items.length}`), ' Punkten, das sind ', h('b', {}, `${p} %`), `. Bearbeitungszeit: ${plural(Math.max(1, Math.round(meta.seconds / 60)), 'Minute', 'Minuten')}.${meta.skipped ? ` ${plural(meta.skipped, 'Aufgabe', 'Aufgaben')} hast du übersprungen.` : ''}${open - (meta.skipped || 0) > 0 ? ` ${plural(open - (meta.skipped || 0), 'Aufgabe', 'Aufgaben')} hast du nicht mehr geschafft.` : ''}`),
          h('div', { class: 'row' },
            h('button', { class: 'btn btn-primary', onclick: startExam }, 'Neue Probeklausur'),
            h('a', { class: 'btn', href: '#/' }, 'Zur Übersicht')),
          reviewList([...results.filter(r => !r.ok), ...results.filter(r => r.ok)]),
        ));
      },
    });
  }
}

// ---------- Fortschritt ----------
function viewProfile() {
  const L = store.levelInfo();
  const u = account.current();
  const solid = S.topics.reduce((a, t) => a + coverage(S, t).solid, 0);
  const total = S.topics.reduce((a, t) => a + t.questions.length, 0);
  const seen = S.topics.reduce((a, t) => a + coverage(S, t).seen, 0);
  add(app,
    h('div', { class: 'page-head' },
      h('h1', {}, 'Dein Fortschritt'),
      h('p', { class: 'lead' }, `Du hast ${seen} von ${total} Fragen gesehen, ${solid} davon sind gefestigt. Eine Frage gilt als gefestigt, wenn du sie an drei verschiedenen Terminen hintereinander richtig beantwortet hast.`),
    ),
    sec('Lerntage', 'Die letzten 14 Tage. Die Zahl im Kästchen ist die Anzahl deiner Antworten.', week(),
      h('p', { class: 'small muted' }, `Stufe ${L.level} („${L.title}“) mit ${store.get().xp} Punkten. Bis zur nächsten Stufe fehlen ${L.toNext} Punkte.`)),
    sec('Stand je Thema', LEGEND, tocList(S.topics, { desc: false, note: t => { const st = store.topicStats(tKey(S, t)); return st.total ? `${topicNote(t)}, ${plural(st.total, 'Antwort', 'Antworten')} insgesamt` : topicNote(t); } })),
    sec('Bestwerte', null, h('table', { class: 'tbl tbl-narrow' },
      h('tbody', {},
        h('tr', {}, h('th', {}, 'Probeklausur'), h('td', {}, store.getBest(`exam:${S.id}`) ? `${store.getBest(`exam:${S.id}`)} %` : 'noch nicht geschrieben')),
        [['zahlen', 'Rechentraining Zahlensysteme'], ['subnet', 'Rechentraining Subnetting'], ['sonst', 'Rechentraining weitere Rechnungen'], ['mix', 'Rechentraining gemischt']]
          .map(([k, label]) => h('tr', {}, h('th', {}, label), h('td', {}, store.getBest(`arcade:${k}`) ? `${store.getBest(`arcade:${k}`)} Punkte` : 'noch kein Sprint')))))),
    sec('Deine Daten', u ? `Dein Lernstand ist im Konto „${u.name}“ gespeichert.` : 'Ohne Konto liegt dein Lernstand nur in diesem Browser.',
      !u && account.isAvailable() ? h('p', {}, h('a', { href: '#/registrieren' }, 'Konto anlegen'), ' und den Stand aus diesem Browser mitnehmen.') : null,
      h('div', { class: 'row' },
        !u ? h('button', { class: 'btn', onclick: async () => { const d = store.exportData(); try { await navigator.clipboard.writeText(d); toast('Dein Stand ist in der Zwischenablage.'); } catch { dialog({ title: 'Stand kopieren', fields: [{ name: 'd', label: 'Diesen Text kopieren', rows: 6, value: d, maxlength: 1e6 }], submit: 'Schließen', cancel: null }); } } }, 'Stand exportieren') : null,
        !u ? h('button', { class: 'btn', onclick: () => dialog({ title: 'Stand importieren', text: 'Füge den exportierten Text ein. Dein jetziger Stand in diesem Browser wird ersetzt.', fields: [{ name: 'd', label: 'Exportierter Stand', rows: 6, maxlength: 1e6 }], submit: 'Importieren', onSubmit({ d }) { try { store.importData(d); } catch { throw new Error('Der eingefügte Text ist kein gültiger Stand.'); } toast('Stand übernommen.'); route(); } }) }, 'Stand importieren') : null,
        h('button', { class: 'btn btn-danger-quiet', onclick: () => dialog({ title: 'Gesamten Fortschritt löschen?', text: 'Punkte, Stand je Thema, Wiederholungen und Bestwerte werden gelöscht. Das lässt sich nicht rückgängig machen.', submit: 'Fortschritt löschen', danger: true, async onSubmit() { if (u) await store.resetRemote(); else store.reset(); toast('Fortschritt gelöscht.'); route(); } }) }, 'Fortschritt löschen'),
      )),
  );
}

// ---------- Router ----------
function route() {
  clearKeys(); clearTimers();
  clear(app);
  window.scrollTo(0, 0);
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  document.body.dataset.view = parts[0] || 'home';
  drawChrome();
  const u = account.current();
  const done = () => { location.hash = '#/'; };
  if (u?.mustChange) return viewForcedPassword(app, { done: route });
  if (parts[0] === 'anmelden') return u ? done() : viewLogin(app);
  if (parts[0] === 'registrieren') return u ? done() : viewRegister(app);
  if (parts[0] === 'konto') return u ? viewAccount(app) : viewLogin(app);
  if (parts[0] === 'verwaltung') return account.isAdmin() ? viewAdmin(app, S) : u ? notFound() : viewLogin(app);
  if (!parts.length) return (u || store.totalAnswers() || store.getDiag(S.id)) ? viewToday() : viewLanding();
  if (parts[0] === 'profil') return viewProfile();
  if (parts[0] !== 'f') return notFound();
  const s = byId[parts[1]];
  if (!s || s.status !== 'aktiv') return notFound();
  const sub = parts[2];
  if (!sub) return viewSubject(s);
  if (sub === 'runde') return viewDaily(s);
  if (sub === 'diagnose') {
    if (parts[3] === 'ergebnis' && store.getDiag(s.id)) return diagResult(app, s, store.getDiag(s.id).result);
    return viewDiagnose(s);
  }
  if (sub === 'klausur') return viewExam(s);
  if (sub === 'arcade') return arcadeMenu(app, s);
  if (sub === 'faelle') return runItems(app, caseItems(s).sort(() => Math.random() - 0.5), { title: 'Fehlersuche', xp: 15, backHref: `#/f/${s.id}`, again: () => route(), intro: 'Jeder Fall beschreibt eine Störung, wie sie im Support ankommt. Lies die Beschreibung und die Befehlsausgabe genau und grenze die Ursache ein.' });
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
    if (act === 'rechnen') return playArcade(app, s, { id: 't:' + t.id, title: t.title, gens: t.gens.map(g => genRegistry[g]) }, { sprint: false });
  }
  notFound();
}

// Hell/Dunkel umschalten, Wahl im Browser merken
const tbtn = document.getElementById('theme-toggle');
function syncTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  tbtn.setAttribute('aria-pressed', String(dark));
  tbtn.setAttribute('aria-label', dark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln');
  tbtn.title = dark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln';
}
tbtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('lernstack.theme', next); } catch { /* kein Speicher */ }
  syncTheme();
});
syncTheme();

// Erst klären, ob jemand angemeldet ist, dann die erste Seite zeichnen.
// Antwortet der Server nicht rechtzeitig, läuft die Seite ohne Konto weiter.
await Promise.race([account.init(), new Promise(r => setTimeout(r, 4000))]);
account.onChange(() => route());
window.addEventListener('hashchange', route);
route();
