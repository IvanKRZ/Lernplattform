// Aufgaben-Pools aus Inhalten und Generatoren zusammenstellen
import { generators, byId as genById } from '../gen/netz.js';
import { fromQuestion, fromGen } from './item.js';
import { shuffle, pick } from '../ui.js';

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

// Mischung aus statischen Fragen und generierten Aufgaben
export function quizRound(subject, topic, n = 10) {
  const st = shuffle(staticItems(subject, topic));
  const nGen = topic.gens?.length ? Math.min(4, Math.round(n * 0.35)) : 0;
  const items = st.slice(0, n - nGen);
  for (let i = 0; i < nGen; i++) items.push(genItem(subject, topic, 1 + (i % 2)));
  return shuffle(items);
}

export function caseItems(subject) {
  return (subject.cases || []).map(c => ({ ...c, type: 'mc', ref: `${subject.id}/case:${c.id}`, topicKey: `${subject.id}/${c.topic}` }));
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
