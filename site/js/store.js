// Fortschritt lokal im Browser (localStorage). Kein Backend.
const KEY = 'lernstack.v1';

const empty = () => ({
  xp: 0,
  topics: {},      // "fach/thema" -> { hist: [1,0,1...], total, correct }
  best: {},        // "arcade:modus" -> Punktzahl
  leitner: {},     // kartenId -> Box 1..5
  streak: { last: null, days: 0 },
  diag: {},        // fach -> { date, result: {thema: quote} }
  achievements: {},
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return Object.assign(empty(), JSON.parse(raw));
  } catch { return empty(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* privater Modus */ }
}

const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(evt) { listeners.forEach(fn => fn(evt)); }

function today() { return new Date().toISOString().slice(0, 10); }

function touchStreak() {
  const t = today();
  const s = state.streak;
  if (s.last === t) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  s.days = s.last === y ? s.days + 1 : 1;
  s.last = t;
}

export const LEVELS = [
  'Kabelträger', 'Patcher', 'Bit-Schubser', 'Hub-Hüter', 'Switch-Lehrling',
  'VLAN-Taktiker', 'Subnetz-Schmied', 'Router-Flüsterer', 'Tunnelbauer', 'Netzwerk-Architekt',
];
export function levelInfo(xp = state.xp) {
  // Level n braucht 60*n*(n-1)/2*... einfach: Schwelle(n) = 40*n^2
  let lvl = 1;
  while (40 * lvl * lvl <= xp) lvl++;
  const lo = 40 * (lvl - 1) * (lvl - 1), hi = 40 * lvl * lvl;
  return {
    level: lvl,
    title: LEVELS[Math.min(lvl - 1, LEVELS.length - 1)],
    progress: (xp - lo) / (hi - lo),
    toNext: hi - xp,
  };
}

export function addXP(n) {
  const before = levelInfo().level;
  state.xp += Math.max(0, Math.round(n));
  touchStreak();
  save();
  const after = levelInfo().level;
  emit({ type: 'xp', n, levelUp: after > before, level: after });
}

export function record(topicKey, ok) {
  const t = state.topics[topicKey] || (state.topics[topicKey] = { hist: [], total: 0, correct: 0 });
  t.hist.push(ok ? 1 : 0);
  if (t.hist.length > 25) t.hist.shift();
  t.total++; if (ok) t.correct++;
  touchStreak();
  save();
}

// Beherrschung 0..1 aus den letzten Antworten, null wenn zu wenig Daten
export function mastery(topicKey) {
  const t = state.topics[topicKey];
  if (!t || t.hist.length < 3) return null;
  return t.hist.reduce((a, b) => a + b, 0) / t.hist.length;
}
export function topicStats(topicKey) { return state.topics[topicKey] || { hist: [], total: 0, correct: 0 }; }

export function setBest(key, score) {
  const prev = state.best[key] || 0;
  if (score > prev) { state.best[key] = score; save(); return true; }
  return false;
}
export function getBest(key) { return state.best[key] || 0; }

export function leitnerBox(id) { return state.leitner[id] || 1; }
export function setLeitner(id, box) { state.leitner[id] = Math.max(1, Math.min(5, box)); save(); }

export function saveDiag(subject, result) { state.diag[subject] = { date: today(), result }; save(); }
export function getDiag(subject) { return state.diag[subject] || null; }

export function unlock(id) {
  if (state.achievements[id]) return false;
  state.achievements[id] = today(); save(); emit({ type: 'achievement', id }); return true;
}
export function hasAchievement(id) { return !!state.achievements[id]; }

export function get() { return state; }
export function streak() {
  const s = state.streak;
  const t = today();
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return (s.last === t || s.last === y) ? s.days : 0;
}
export function reset() { state = empty(); save(); emit({ type: 'reset' }); }
export function exportData() { return JSON.stringify(state); }
export function importData(json) { state = Object.assign(empty(), JSON.parse(json)); save(); emit({ type: 'reset' }); }
