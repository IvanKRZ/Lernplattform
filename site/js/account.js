// Angemeldeter Nutzer und alles, was mit dem Konto zu tun hat.
import { api } from './api.js';
import * as store from './store.js';

let user = null;
let registration = 'open';   // open | code | closed
let available = false;       // false, wenn die API nicht antwortet (dann läuft alles ohne Konto weiter)

const listeners = new Set();
export function onChange(fn) { listeners.add(fn); }
const emit = () => listeners.forEach(fn => fn(user));

export const current = () => user;
export const isAdmin = () => user?.role === 'admin';
export const registrationMode = () => registration;
export const isAvailable = () => available;

// Beim Laden der Seite: Wer ist angemeldet? Danach den Lernstand des Kontos holen.
export async function init() {
  try {
    const me = await api('GET', '/api/me');
    available = true;
    registration = me.registration;
    if (me.user) await enter(me.user);
  } catch { available = false; }
}

async function enter(u) {
  const progress = await api('GET', '/api/progress');
  user = u;
  const result = store.attach(u, progress);
  emit();
  return result;
}

export async function login(name, password) {
  const r = await api('POST', '/api/login', { name, password });
  return enter(r.user);
}
export async function register(name, password, code) {
  const r = await api('POST', '/api/register', { name, password, code });
  return enter(r.user);
}
export async function logout() {
  try { await store.flush(); } catch { /* dann eben ohne letzten Abgleich */ }
  try { await api('POST', '/api/logout', {}); } catch { /* Sitzung läuft sonst von selbst ab */ }
  leave();
}
// Sitzung ist weg (abgelaufen, gesperrt oder abgemeldet): zurück in den Betrieb ohne Konto.
export function leave() {
  user = null;
  store.detach();
  emit();
}
export async function changePassword(current, next) {
  const r = await api('POST', '/api/password', { current, next });
  user = r.user; emit();
}
export async function deleteAccount(password) {
  await api('DELETE', '/api/me', { password });
  leave();
}
