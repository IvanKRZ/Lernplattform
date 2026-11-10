// Prüft die API gegen eine frische Datenbank: node tests/api.mjs
// Startet den Server auf einem freien Port in einem temporären Ordner und räumt danach auf.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lernstack-test-'));
const port = 4300 + Math.floor(Math.random() * 500);
const base = `http://127.0.0.1:${port}`;
const proc = spawn(process.execPath, ['--no-warnings', new URL('../server/server.mjs', import.meta.url).pathname], {
  env: { ...process.env, PORT: String(port), DATA_DIR: dir, ADMIN_PASSWORD: 'admin-test-passwort', STATIC_DIR: '' },
  stdio: ['ignore', 'pipe', 'inherit'],
});
await new Promise((resolve, reject) => {
  proc.stdout.on('data', d => { if (String(d).includes('läuft')) resolve(); });
  proc.on('exit', c => reject(new Error(`Server beendet (${c})`)));
});

// Ein „Browser“: merkt sich das Sitzungs-Cookie.
function client() {
  let cookie = '';
  return async (method, url, body, headers = {}) => {
    const res = await fetch(base + url, {
      method,
      headers: { ...(method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-Requested-With': 'lernstack' }), ...(cookie ? { Cookie: cookie } : {}), ...headers },
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, body: await res.json(), setCookie: set };
  };
}

let failed = 0;
async function test(name, fn) {
  try { await fn(); console.log('ok   ', name); }
  catch (e) { failed++; console.error('FEHLER', name, '\n      ', e.message); }
}

try {
  const anna = client(), admin = client(), gast = client();

  await test('Ohne Anmeldung gibt es keinen Nutzer und keinen Fortschritt', async () => {
    assert.equal((await gast('GET', '/api/me')).body.user, null);
    assert.equal((await gast('GET', '/api/progress')).status, 401);
    assert.equal((await gast('GET', '/api/admin/users')).status, 401);
  });

  await test('Registrierung prüft Namen und Passwort', async () => {
    assert.equal((await anna('POST', '/api/register', { name: 'a', password: 'langes-passwort' })).status, 400);
    assert.equal((await anna('POST', '/api/register', { name: 'Anna', password: 'kurz' })).status, 400);
    assert.equal((await anna('POST', '/api/register', { name: 'ivan', password: 'langes-passwort' })).status, 409);
    const r = await anna('POST', '/api/register', { name: 'Anna', password: 'langes-passwort' });
    assert.equal(r.status, 200);
    assert.equal(r.body.user.name, 'Anna');
    assert.match(r.setCookie, /HttpOnly; SameSite=Lax/);
    assert.equal((await gast('POST', '/api/register', { name: 'ANNA', password: 'langes-passwort' })).status, 409);
  });

  await test('Schreibende Anfragen ohne den eigenen Kopf werden abgelehnt (CSRF)', async () => {
    const r = await anna('POST', '/api/logout', {}, { 'X-Requested-With': '' });
    assert.equal(r.status, 403);
    assert.equal((await anna('GET', '/api/me')).body.user.name, 'Anna');
  });

  await test('Fortschritt speichern, laden und Konflikte erkennen', async () => {
    assert.deepEqual((await anna('GET', '/api/progress')).body, { data: null, rev: 0 });
    const state = { xp: 120, topics: { 'netzwerktechnik/subnetting': { hist: [1, 1, 0, 1], total: 4, correct: 3 } } };
    assert.equal((await anna('PUT', '/api/progress', { data: state, rev: 0 })).body.rev, 1);
    assert.equal((await anna('PUT', '/api/progress', { data: { ...state, xp: 130 }, rev: 1 })).body.rev, 2);
    const conflict = await anna('PUT', '/api/progress', { data: { ...state, xp: 5 }, rev: 1 });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.data.xp, 130);
    assert.equal((await anna('PUT', '/api/progress', { data: [1, 2], rev: 2 })).status, 400);
    assert.equal((await anna('GET', '/api/progress')).body.data.xp, 130);
  });

  await test('Anmelden, falsches Passwort, Abmelden', async () => {
    const zweites = client();
    assert.equal((await zweites('POST', '/api/login', { name: 'anna', password: 'falsch-falsch' })).status, 401);
    assert.equal((await zweites('POST', '/api/login', { name: 'gibt-es-nicht', password: 'falsch-falsch' })).status, 401);
    assert.equal((await zweites('POST', '/api/login', { name: 'anna', password: 'langes-passwort' })).status, 200);
    assert.equal((await zweites('GET', '/api/progress')).body.data.xp, 130);
    await zweites('POST', '/api/logout');
    assert.equal((await zweites('GET', '/api/me')).body.user, null);
  });

  await test('Normale Nutzer kommen nicht in die Verwaltung', async () => {
    assert.equal((await anna('GET', '/api/admin/users')).status, 403);
    assert.equal((await anna('PUT', '/api/admin/settings', { registration: 'closed' })).status, 403);
  });

  await test('Fehlermeldung landet in der Verwaltung', async () => {
    assert.equal((await anna('POST', '/api/reports', { ref: 'netzwerktechnik/subnetting/s6', question: 'Frage?', note: 'Antwort B stimmt auch.' })).status, 200);
    assert.equal((await gast('POST', '/api/reports', { ref: '<script>', note: 'x' })).status, 400);
  });

  let annaId;
  await test('Ivan sieht Konten, Lernstand und Meldungen', async () => {
    assert.equal((await admin('POST', '/api/login', { name: 'Ivan', password: 'admin-test-passwort' })).body.user.role, 'admin');
    const { body } = await admin('GET', '/api/admin/users');
    assert.equal(body.users.length, 2);
    const a = body.users.find(u => u.name === 'Anna');
    annaId = a.id;
    assert.equal(a.xp, 130);
    assert.equal(a.answers, 4);
    assert.equal(a.topics['netzwerktechnik/subnetting'].m, 0.75);
    assert.equal(body.openReports, 1);
    const reports = (await admin('GET', '/api/admin/reports')).body.reports;
    assert.equal(reports[0].user, 'Anna');
    assert.equal((await admin('PATCH', `/api/admin/reports/${reports[0].id}`, { done: true })).status, 200);
    assert.equal((await admin('GET', '/api/admin/users')).body.openReports, 0);
  });

  await test('Passwort zurücksetzen erzwingt ein neues Passwort und beendet Sitzungen', async () => {
    const { body } = await admin('POST', `/api/admin/users/${annaId}/reset-password`);
    assert.ok(body.password.length >= 14);
    assert.equal((await anna('GET', '/api/me')).body.user, null);
    const login = await anna('POST', '/api/login', { name: 'Anna', password: body.password });
    assert.equal(login.body.user.mustChange, true);
    assert.equal((await anna('POST', '/api/password', { current: body.password, next: 'neues-langes-passwort' })).body.user.mustChange, false);
    assert.equal((await anna('GET', '/api/progress')).body.data.xp, 130);
  });

  await test('Sperren, Einladungscode, geschlossene Registrierung', async () => {
    await admin('PATCH', `/api/admin/users/${annaId}`, { disabled: true });
    assert.equal((await anna('GET', '/api/me')).body.user, null);
    assert.equal((await anna('POST', '/api/login', { name: 'Anna', password: 'neues-langes-passwort' })).status, 403);
    await admin('PATCH', `/api/admin/users/${annaId}`, { disabled: false });
    assert.equal((await anna('POST', '/api/login', { name: 'Anna', password: 'neues-langes-passwort' })).status, 200);

    assert.equal((await admin('PUT', '/api/admin/settings', { registration: 'code', code: 'kurz' })).status, 400);
    await admin('PUT', '/api/admin/settings', { registration: 'code', code: 'FISI-2026' });
    assert.equal((await gast('POST', '/api/register', { name: 'Bernd', password: 'langes-passwort', code: 'falsch' })).status, 403);
    assert.equal((await gast('POST', '/api/register', { name: 'Bernd', password: 'langes-passwort', code: 'FISI-2026' })).status, 200);
    await admin('PUT', '/api/admin/settings', { registration: 'closed', code: '' });
    assert.equal((await client()('POST', '/api/register', { name: 'Clara', password: 'langes-passwort' })).status, 403);
    assert.equal((await gast('GET', '/api/me')).body.registration, 'closed');
  });

  await test('Das Verwaltungskonto lässt sich weder sperren noch löschen', async () => {
    const ivan = (await admin('GET', '/api/admin/users')).body.users.find(u => u.role === 'admin');
    assert.equal((await admin('DELETE', `/api/admin/users/${ivan.id}`)).status, 400);
    assert.equal((await admin('PATCH', `/api/admin/users/${ivan.id}`, { disabled: true })).status, 400);
    assert.equal((await admin('DELETE', '/api/me', { password: 'admin-test-passwort' })).status, 400);
  });

  await test('Konto löschen entfernt auch den Fortschritt', async () => {
    assert.equal((await anna('DELETE', '/api/me', { password: 'falsch-falsch' })).status, 403);
    assert.equal((await anna('DELETE', '/api/me', { password: 'neues-langes-passwort' })).status, 200);
    assert.equal((await anna('POST', '/api/login', { name: 'Anna', password: 'neues-langes-passwort' })).status, 401);
    assert.equal((await admin('GET', '/api/admin/users')).body.users.some(u => u.name === 'Anna'), false);
  });
} finally {
  proc.kill();
  fs.rmSync(dir, { recursive: true, force: true });
}

if (failed) { console.error(`\n${failed} Test(s) fehlgeschlagen`); process.exit(1); }
console.log('\nAPI in Ordnung.');
