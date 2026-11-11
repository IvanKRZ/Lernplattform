// Lernstand. Ohne Konto liegt er nur im localStorage dieses Browsers.
// Mit Konto wird er zusätzlich auf dem Server gespeichert (siehe attach) und ist auf jedem Gerät derselbe.
import { api } from './api.js';

const GUEST_KEY = 'lernstack.v1';
const userKey = id => `lernstack.u${id}`;

const empty = () => ({
  xp: 0,
  topics: {},      // "fach/thema" -> { hist: [1,0,1...], total, correct }
  q: {},           // Aufgabenreferenz -> [Fach 0..5, fällig ab Tag, Anzahl Antworten]
  days: {},        // "2026-11-10" -> Anzahl Antworten an diesem Tag
  best: {},        // "arcade:modus" -> Punktzahl
  streak: { last: null, days: 0 },
  diag: {},        // fach -> { date, result: {thema: quote} }
});

let account = null;   // { id } wenn angemeldet
let rev = 0;          // Versionsnummer des Stands auf dem Server
let state = read(GUEST_KEY);

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? normalize(JSON.parse(raw)) : empty();
  } catch { return empty(); }
}
function normalize(data) {
  const s = Object.assign(empty(), data && typeof data === 'object' ? data : {});
  for (const k of ['topics', 'q', 'days', 'best', 'diag']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
  if (!s.streak || typeof s.streak !== 'object') s.streak = { last: null, days: 0 };
  s.xp = Number(s.xp) || 0;
  return s;
}
function save() {
  try { localStorage.setItem(account ? userKey(account.id) : GUEST_KEY, JSON.stringify(state)); } catch { /* privater Modus */ }
  if (account) schedulePush();
}

const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(evt) { listeners.forEach(fn => fn(evt)); }

// ---------- Tage: immer in der Ortszeit des Nutzers ----------
const pad = n => String(n).padStart(2, '0');
export function isoDay(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
// Fortlaufende Tagesnummer, damit sich Abstände in Tagen einfach rechnen lassen.
export function dayNo(d = new Date()) { return Math.floor((d.getTime() - d.getTimezoneOffset() * 60e3) / 864e5); }
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

function touchDay() {
  const t = isoDay();
  state.days[t] = (state.days[t] || 0) + 1;
  const keys = Object.keys(state.days).sort();
  while (keys.length > 120) delete state.days[keys.shift()];
  const s = state.streak;
  if (s.last === t) return;
  s.days = s.last === isoDay(daysAgo(1)) ? s.days + 1 : 1;
  s.last = t;
}

// ---------- Punkte und Stufen ----------
export const LEVELS = [
  'Kabelträger', 'Patcher', 'Bit-Schubser', 'Hub-Hüter', 'Switch-Lehrling',
  'VLAN-Taktiker', 'Subnetz-Schmied', 'Router-Flüsterer', 'Tunnelbauer', 'Netzwerk-Architekt',
];
export function levelInfo(xp = state.xp) {
  // Schwelle für Stufe n: 40 * n²
  let lvl = 1;
  while (40 * lvl * lvl <= xp) lvl++;
  const lo = 40 * (lvl - 1) * (lvl - 1), hi = 40 * lvl * lvl;
  return { level: lvl, title: LEVELS[Math.min(lvl - 1, LEVELS.length - 1)], progress: (xp - lo) / (hi - lo), toNext: hi - xp };
}
export function addXP(n) {
  const before = levelInfo().level;
  state.xp += Math.max(0, Math.round(n));
  save();
  const after = levelInfo().level;
  emit({ type: 'xp', n, levelUp: after > before, level: after });
}

// ---------- Antworten festhalten ----------
// Wiederholung mit wachsenden Abständen (Karteikasten nach Leitner):
// Jede richtig beantwortete Frage wandert ein Fach weiter und kommt später wieder.
// Eine falsche Antwort stellt sie zurück in Fach 1, also auf morgen.
export const INTERVALS = [0, 1, 3, 7, 14, 30];
export const SOLID_BOX = 3;

/**
 * @param topicKey  "fach/thema"
 * @param ok        richtig beantwortet?
 * @param ref       Referenz einer festen Frage. Generierte Rechenaufgaben haben keine, sie sind jedes Mal neu.
 */
export function record(topicKey, ok, ref) {
  const t = state.topics[topicKey] || (state.topics[topicKey] = { hist: [], total: 0, correct: 0 });
  t.hist.push(ok ? 1 : 0);
  if (t.hist.length > 25) t.hist.shift();
  t.total++; if (ok) t.correct++;
  if (ref) {
    const [box = 0, , n = 0] = state.q[ref] || [];
    const next = ok ? Math.min(5, box + 1) : 1;
    state.q[ref] = [next, dayNo() + INTERVALS[next], n + 1];
  }
  touchDay();
  save();
  emit({ type: 'answer' });
}

export function qInfo(ref) {
  const e = state.q[ref];
  if (!e) return { seen: false, box: 0, due: false, solid: false };
  return { seen: true, box: e[0], due: e[1] <= dayNo(), dueDay: e[1], solid: e[0] >= SOLID_BOX, n: e[2] };
}

// Beherrschung 0..1 aus den letzten Antworten, null wenn zu wenig Daten
export function mastery(topicKey) {
  const t = state.topics[topicKey];
  if (!t || t.hist.length < 3) return null;
  return t.hist.reduce((a, b) => a + b, 0) / t.hist.length;
}
export function topicStats(topicKey) { return state.topics[topicKey] || { hist: [], total: 0, correct: 0 }; }
export function totalAnswers() { return Object.values(state.topics).reduce((a, t) => a + (t.total || 0), 0); }

export function setBest(key, score) {
  const prev = state.best[key] || 0;
  if (score > prev) { state.best[key] = score; save(); return true; }
  return false;
}
export function getBest(key) { return state.best[key] || 0; }

export function saveDiag(subject, result) { state.diag[subject] = { date: isoDay(), result }; save(); }
export function getDiag(subject) { return state.diag[subject] || null; }

export function get() { return state; }
export function streak() {
  const s = state.streak;
  return (s.last === isoDay() || s.last === isoDay(daysAgo(1))) ? s.days : 0;
}
// Die letzten n Tage, ältester zuerst: [{ date: Date, iso, count }]
export function activity(n = 14) {
  return Array.from({ length: n }, (_, i) => {
    const date = daysAgo(n - 1 - i), iso = isoDay(date);
    return { date, iso, count: state.days[iso] || 0 };
  });
}

export function reset() {
  state = empty(); save(); emit({ type: 'reset' });
}
export function exportData() { return JSON.stringify(state); }
export function importData(json) { state = normalize(JSON.parse(json)); save(); emit({ type: 'reset' }); }

// ---------- Abgleich mit dem Server ----------
let pushTimer = null, pushing = false, dirty = false;
let syncState = 'idle';   // idle | saving | offline
export function syncStatus() { return account ? syncState : 'local'; }
function setSync(s) { if (s !== syncState) { syncState = s; emit({ type: 'sync', status: s }); } }

function schedulePush() {
  dirty = true;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 1200);
}
async function push({ keepalive = false } = {}) {
  if (!account || pushing || !dirty) return;
  pushing = true; dirty = false;
  setSync('saving');
  try {
    const r = await api('PUT', '/api/progress', { data: state, rev }, { keepalive });
    rev = r.rev;
    setSync('idle');
  } catch (e) {
    if (e.status === 409 && e.body?.data) {
      // Auf einem anderen Gerät wurde weitergelernt. Der Stand vom Server gilt.
      state = normalize(e.body.data); rev = e.body.rev;
      try { localStorage.setItem(userKey(account.id), JSON.stringify(state)); } catch { /* egal */ }
      setSync('idle');
      emit({ type: 'reset', reason: 'conflict' });
    } else if (e.status === 401) {
      setSync('offline');
      emit({ type: 'signed-out' });
    } else {
      dirty = true;
      setSync('offline');
      clearTimeout(pushTimer);
      pushTimer = setTimeout(push, 15000);
    }
  } finally {
    pushing = false;
    if (dirty && syncState !== 'offline') schedulePush();
  }
}
// Beim Verlassen der Seite noch nicht gespeicherte Antworten mitgeben.
addEventListener('pagehide', () => { if (dirty) { clearTimeout(pushTimer); push({ keepalive: true }); } });
// Zurück im Tab: prüfen, ob auf einem anderen Gerät etwas dazugekommen ist.
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || !account || dirty || pushing) return;
  try {
    const r = await api('GET', '/api/progress');
    if (r.rev > rev && r.data && !dirty) { state = normalize(r.data); rev = r.rev; emit({ type: 'reset', reason: 'refresh' }); }
  } catch { /* offline: beim nächsten Speichern fällt es auf */ }
});

/**
 * Nach der Anmeldung: Stand vom Server übernehmen.
 * Hat das Konto noch keinen Stand, wandert der bisherige Stand aus diesem Browser ins Konto.
 * @returns 'adopted' wenn lokaler Fortschritt ins Konto übernommen wurde, sonst 'loaded' oder 'new'
 */
export function attach(user, server) {
  const guest = state;
  account = { id: user.id };
  let result;
  if (server?.data) { state = normalize(server.data); rev = server.rev; result = 'loaded'; }
  else {
    rev = 0;
    const hasGuestProgress = !!Object.keys(guest.topics).length || guest.xp > 0;
    state = hasGuestProgress ? guest : empty();
    result = hasGuestProgress ? 'adopted' : 'new';
    if (hasGuestProgress) { try { localStorage.removeItem(GUEST_KEY); } catch { /* egal */ } }
    save();
  }
  try { localStorage.setItem(userKey(user.id), JSON.stringify(state)); } catch { /* egal */ }
  emit({ type: 'reset', reason: 'attach' });
  return result;
}
export async function flush() { clearTimeout(pushTimer); await push(); }
export function detach() {
  clearTimeout(pushTimer);
  if (account) { try { localStorage.removeItem(userKey(account.id)); } catch { /* egal */ } }
  account = null; rev = 0; dirty = false; syncState = 'idle';
  state = read(GUEST_KEY);
  emit({ type: 'reset', reason: 'detach' });
}
// Fortschritt im Konto löschen (lokal und auf dem Server)
export async function resetRemote() {
  clearTimeout(pushTimer); dirty = false;
  await api('DELETE', '/api/progress', {});
  rev = 0; state = empty();
  try { localStorage.setItem(userKey(account.id), JSON.stringify(state)); } catch { /* egal */ }
  emit({ type: 'reset' });
}
