// Aufgaben-Pools aus Inhalten und Generatoren zusammenstellen
import { generators, byId as genById } from '../gen/netz.js';
import { fromQuestion, fromGen } from './item.js';
import { shuffle, pick } from '../ui.js';
import * as store from '../store.js';
import { byId as subjectById } from '../../content/subjects.js';

export const genRegistry = genById;
export { generators };

export function tKey(subject, topic) { return `${subject.id}/${topic.id}`; }

export function staticItems(subject, topic) {
  return (topic.questions || []).map(q => fromQuestion(q, tKey(subject, topic)));
}

export function genItem(subject, topic, level = 1, genId) {
  const ids = genId ? [genId] : (topic.gens || []);
  if (!ids.length) return null;
  const g = genById[pick(ids)];
  return fromGen(g, g.make(level), tKey(subject, topic));
}

// Thema zu einem Schlüssel "fach/thema" nachschlagen, z. B. für die Themenmarke über einer Aufgabe
export function topicByKey(key) {
  const [sid, tid] = String(key).split('/');
  return subjectById[sid]?.topics.find(t => t.id === tid) || null;
}

// Reihenfolge, in der Fragen am meisten bringen: erst fällige Wiederholungen,
// dann noch nie gesehene Fragen, zuletzt die, die am wenigsten gefestigt sind.
function byNeed(items) {
  const rank = it => { const q = store.qInfo(it.ref); return q.due ? 0 : !q.seen ? 1 : 2 + q.box; };
  return shuffle(items).sort((a, b) => rank(a) - rank(b));
}

// Wie weit ist ein Thema? Gesehen, gefestigt (ab Fach 3) und heute fällig.
export function coverage(subject, topic) {
  const infos = staticItems(subject, topic).map(i => store.qInfo(i.ref));
  return { total: infos.length, seen: infos.filter(q => q.seen).length, solid: infos.filter(q => q.solid).length, due: infos.filter(q => q.due).length };
}
export function dueItems(subject) {
  const all = [...subject.topics.flatMap(t => staticItems(subject, t)), ...caseItems(subject)];
  return all.filter(i => store.qInfo(i.ref).due).sort((a, b) => store.qInfo(a.ref).dueDay - store.qInfo(b.ref).dueDay);
}

// Tagesrunde: zuerst fällige Wiederholungen quer durch alle Themen, dann neue Fragen
// aus dem ersten Thema, das noch nicht komplett gesehen wurde, dazu etwas zum Rechnen.
export function dailyItems(subject, n = 12) {
  const due = dueItems(subject).slice(0, n);
  const fresh = [];
  const room = Math.min(n - due.length, 6);
  for (const t of subject.topics) {
    if (fresh.length >= room) break;
    const unseen = shuffle(staticItems(subject, t).filter(i => !store.qInfo(i.ref).seen));
    fresh.push(...unseen.slice(0, room - fresh.length));
  }
  // Rechnen bleibt nur durch Rechnen sicher: zwei Aufgaben aus Themen, die schon dran waren.
  const started = subject.topics.filter(t => t.gens?.length && store.topicStats(tKey(subject, t)).total > 0);
  const calcTopics = started.length ? started : subject.topics.filter(t => t.gens?.length).slice(0, 1);
  const calc = calcTopics.length ? [1, 2].map(level => genItem(subject, pick(calcTopics), level)) : [];
  return { items: shuffle([...due, ...fresh, ...calc]), due: due.length, fresh: fresh.length, calc: calc.length };
}

// Mischung aus statischen Fragen und generierten Aufgaben
export function quizRound(subject, topic, n = 10) {
  const st = byNeed(staticItems(subject, topic));
  const nGen = topic.gens?.length ? Math.min(4, Math.round(n * 0.35)) : 0;
  const items = st.slice(0, n - nGen);
  for (let i = 0; i < nGen; i++) items.push(genItem(subject, topic, 1 + (i % 2)));
  return shuffle(items);
}

export function caseItems(subject) {
  return (subject.cases || []).map(c => ({ ...c, type: 'mc', ref: `${subject.id}/case:${c.id}`, topicKey: `${subject.id}/${c.topic}`, track: true }));
}

// Klausur: über alle Themen verteilt, ca. 30 % Rechenaufgaben, dazu 2 Fälle
export function examItems(subject, count = 25) {
  const topics = subject.topics;
  const items = [];
  const cases = shuffle(caseItems(subject)).slice(0, 2);
  const per = Math.floor((count - cases.length) / topics.length);
  let rest = count - cases.length - per * topics.length;
  for (const t of shuffle(topics)) {
    let k = per + (rest-- > 0 ? 1 : 0);
    if (t.gens?.length && k > 0) { items.push(genItem(subject, t, 2)); k--; }
    if (t.gens?.length > 3 && k > 1) { items.push(genItem(subject, t, 2)); k--; }
    items.push(...shuffle(staticItems(subject, t)).slice(0, k));
  }
  return shuffle([...items, ...cases]);
}

// Einstufung: 3 Aufgaben pro Thema. Gerechnet wird nur je einmal bei Zahlensystemen
// und Subnetting, alle anderen Aufgaben sind Verständnisfragen ohne Eingabefeld.
const DIAG_CALC = ['zahlensysteme', 'subnetting'];
export function diagItems(subject) {
  const out = [];
  for (const t of subject.topics) {
    const st = shuffle(staticItems(subject, t).filter(i => i.type !== 'input'));
    const its = DIAG_CALC.includes(t.id) && t.gens?.length ? [st[0], st[1], genItem(subject, t, 1)] : st.slice(0, 3);
    its.forEach(i => out.push({ ...i, diagTopic: t.id }));
  }
  return out;
}
