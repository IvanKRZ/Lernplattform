// Lernstack-API: Konten, Sitzungen, Lernfortschritt, Fehlermeldungen, Verwaltung.
// Bewusst ohne npm-Abhängigkeiten: nur Node (ab 22.13) mit eingebautem SQLite.
//
// Umgebungsvariablen:
//   PORT            Port, Standard 3000
//   DATA_DIR        Ordner für die Datenbank, Standard ./data
//   ADMIN_PASSWORD  Startpasswort für das Konto „Ivan“. Wird nur beim ersten Anlegen benutzt.
//   STATIC_DIR      Nur für lokale Entwicklung und Tests: liefert zusätzlich die Seite aus (wie nginx).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
const STATIC_DIR = process.env.STATIC_DIR ? path.resolve(process.env.STATIC_DIR) : null;
const ADMIN_NAME = 'Ivan';
const SESSION_DAYS = 30;
const MAX_BODY = 300 * 1024;
const MAX_USERS = 2000;
const COOKIE = 'ls_sid';

// Datenbank und Startpasswort sind nur für den Dienst selbst lesbar.
process.umask(0o077);
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'lernstack.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    name_lc TEXT NOT NULL UNIQUE,
    pw TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    disabled INTEGER NOT NULL DEFAULT 0,
    must_change INTEGER NOT NULL DEFAULT 0,
    created INTEGER NOT NULL,
    last_seen INTEGER
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created INTEGER NOT NULL,
    expires INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    rev INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    answers INTEGER NOT NULL DEFAULT 0,
    updated INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ref TEXT NOT NULL,
    question TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    done INTEGER NOT NULL DEFAULT 0,
    created INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

const q = {
  userByName: db.prepare('SELECT * FROM users WHERE name_lc = ?'),
  userById: db.prepare('SELECT * FROM users WHERE id = ?'),
  userCount: db.prepare('SELECT COUNT(*) AS n FROM users'),
  insertUser: db.prepare('INSERT INTO users (name, name_lc, pw, role, must_change, created) VALUES (?, ?, ?, ?, ?, ?)'),
  setPw: db.prepare('UPDATE users SET pw = ?, must_change = ? WHERE id = ?'),
  setDisabled: db.prepare('UPDATE users SET disabled = ? WHERE id = ?'),
  touchUser: db.prepare('UPDATE users SET last_seen = ? WHERE id = ?'),
  deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
  insertSession: db.prepare('INSERT INTO sessions (token, user_id, created, expires) VALUES (?, ?, ?, ?)'),
  session: db.prepare('SELECT * FROM sessions WHERE token = ?'),
  extendSession: db.prepare('UPDATE sessions SET expires = ? WHERE token = ?'),
  deleteSession: db.prepare('DELETE FROM sessions WHERE token = ?'),
  deleteUserSessions: db.prepare('DELETE FROM sessions WHERE user_id = ?'),
  deleteOtherSessions: db.prepare('DELETE FROM sessions WHERE user_id = ? AND token <> ?'),
  purgeSessions: db.prepare('DELETE FROM sessions WHERE expires < ?'),
  progress: db.prepare('SELECT data, rev FROM progress WHERE user_id = ?'),
  insertProgress: db.prepare('INSERT INTO progress (user_id, data, rev, xp, answers, updated) VALUES (?, ?, 1, ?, ?, ?)'),
  updateProgress: db.prepare('UPDATE progress SET data = ?, rev = rev + 1, xp = ?, answers = ?, updated = ? WHERE user_id = ?'),
  deleteProgress: db.prepare('DELETE FROM progress WHERE user_id = ?'),
  allProgress: db.prepare('SELECT data FROM progress'),
  users: db.prepare(`SELECT u.id, u.name, u.role, u.disabled, u.must_change, u.created, u.last_seen,
                            p.xp, p.answers, p.updated, p.data
                     FROM users u LEFT JOIN progress p ON p.user_id = u.id ORDER BY u.name_lc`),
  insertReport: db.prepare('INSERT INTO reports (user_id, ref, question, note, created) VALUES (?, ?, ?, ?, ?)'),
  reports: db.prepare(`SELECT r.id, r.ref, r.question, r.note, r.done, r.created, u.name AS user
                       FROM reports r LEFT JOIN users u ON u.id = r.user_id ORDER BY r.done, r.created DESC LIMIT 500`),
  openReports: db.prepare('SELECT COUNT(*) AS n FROM reports WHERE done = 0'),
  setReportDone: db.prepare('UPDATE reports SET done = ? WHERE id = ?'),
  deleteReport: db.prepare('DELETE FROM reports WHERE id = ?'),
  setting: db.prepare('SELECT value FROM settings WHERE key = ?'),
  putSetting: db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'),
};

const now = () => Date.now();
const getSetting = (key, fallback) => q.setting.get(key)?.value ?? fallback;

// ---------- Passwörter ----------
const scrypt = promisify(crypto.scrypt);
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 128 * 32768 * 8 * 2 };
async function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(pw.normalize('NFKC'), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}
async function verifyPassword(pw, stored) {
  const [kind, N, salt, hash] = String(stored).split('$');
  if (kind !== 'scrypt') return false;
  const want = Buffer.from(hash, 'base64url');
  const got = await scrypt(pw.normalize('NFKC'), Buffer.from(salt, 'base64url'), want.length, { ...SCRYPT, N: Number(N) });
  return crypto.timingSafeEqual(want, got);
}
// Gleicher Rechenaufwand, wenn es den Namen gar nicht gibt. Sonst verrät die Antwortzeit, welche Konten existieren.
const DUMMY_HASH = await hashPassword(crypto.randomBytes(12).toString('hex'));

function randomPassword() {
  // Ohne leicht verwechselbare Zeichen (0/O, 1/l/I), damit man es abtippen kann.
  const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.randomBytes(14), b => abc[b % abc.length]).join('').replace(/(.{5})(.{5})(.{4})/, '$1-$2-$3');
}

// ---------- Eingaben prüfen ----------
class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra; }
}
const fail = (status, message, extra) => { throw new HttpError(status, message, extra); };

function checkName(name) {
  if (typeof name !== 'string') fail(400, 'Bitte gib einen Benutzernamen ein.');
  name = name.trim().normalize('NFKC');
  if (!/^[\p{L}\p{N}][\p{L}\p{N}._-]{2,23}$/u.test(name)) fail(400, 'Der Benutzername braucht 3 bis 24 Zeichen. Erlaubt sind Buchstaben, Ziffern, Punkt, Bindestrich und Unterstrich.');
  return name;
}
function checkPassword(pw, name = '') {
  if (typeof pw !== 'string' || pw.length < 10) fail(400, 'Das Passwort braucht mindestens 10 Zeichen.');
  if (pw.length > 200) fail(400, 'Das Passwort darf höchstens 200 Zeichen haben.');
  if (name && pw.toLowerCase() === name.toLowerCase()) fail(400, 'Das Passwort darf nicht dem Benutzernamen entsprechen.');
  return pw;
}

// ---------- Anfragen begrenzen (im Arbeitsspeicher, reicht für eine Instanz) ----------
const buckets = new Map();
function limit(key, max, windowMs, message = 'Zu viele Versuche. Bitte warte ein paar Minuten und probier es dann noch einmal.') {
  const t = now();
  const b = buckets.get(key);
  if (!b || b.reset < t) { buckets.set(key, { n: 1, reset: t + windowMs }); return; }
  if (++b.n > max) fail(429, message);
}
const unlimit = key => buckets.delete(key);
setInterval(() => {
  const t = now();
  for (const [k, b] of buckets) if (b.reset < t) buckets.delete(k);
  q.purgeSessions.run(t);
}, 10 * 60e3).unref();

// ---------- Sitzungen ----------
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
function clientIp(req) {
  return String(req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '?');
}
function cookieFlags(req) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || process.env.COOKIE_SECURE === '1';
  return `Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}
function startSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  q.insertSession.run(sha(token), userId, now(), now() + SESSION_DAYS * 864e5);
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Max-Age=${SESSION_DAYS * 86400}; ${cookieFlags(req)}`);
}
function endSession(req, res) {
  const token = readCookie(req);
  if (token) q.deleteSession.run(sha(token));
  res.setHeader('Set-Cookie', `${COOKIE}=; Max-Age=0; ${cookieFlags(req)}`);
}
function readCookie(req) {
  const m = /(?:^|;\s*)ls_sid=([A-Za-z0-9_-]{20,})/.exec(req.headers.cookie || '');
  return m ? m[1] : null;
}
function currentUser(req) {
  const token = readCookie(req);
  if (!token) return null;
  const key = sha(token);
  const s = q.session.get(key);
  if (!s || s.expires < now()) return null;
  const u = q.userById.get(s.user_id);
  if (!u || u.disabled) return null;
  // Sitzung gleitend verlängern und „zuletzt aktiv“ pflegen, aber höchstens einmal pro Stunde schreiben.
  if (!u.last_seen || now() - u.last_seen > 36e5) {
    q.touchUser.run(now(), u.id);
    q.extendSession.run(now() + SESSION_DAYS * 864e5, key);
  }
  u.sessionKey = key;
  return u;
}
const publicUser = u => u && { id: u.id, name: u.name, role: u.role, mustChange: !!u.must_change };
const needUser = req => currentUser(req) || fail(401, 'Bitte melde dich an.');
function needAdmin(req) {
  const u = needUser(req);
  if (u.role !== 'admin') fail(403, 'Dafür brauchst du Verwaltungsrechte.');
  if (u.must_change) fail(403, 'Bitte vergib zuerst ein eigenes Passwort.');
  return u;
}

// ---------- Fortschritt ----------
function summarize(data) {
  const xp = Number.isFinite(data.xp) ? Math.max(0, Math.min(1e9, Math.round(data.xp))) : 0;
  let answers = 0;
  if (data.topics && typeof data.topics === 'object') for (const t of Object.values(data.topics)) answers += Number(t?.total) || 0;
  return { xp, answers: Math.min(answers, 1e9) };
}
function topicMastery(dataJson) {
  // Anteil richtiger Antworten je Thema aus dem gespeicherten Verlauf, nur für die Verwaltung.
  const out = {};
  try {
    const topics = JSON.parse(dataJson).topics || {};
    for (const [key, t] of Object.entries(topics)) {
      const hist = Array.isArray(t?.hist) ? t.hist : [];
      if (hist.length >= 3) out[key] = { m: hist.reduce((a, b) => a + (b ? 1 : 0), 0) / hist.length, n: Number(t.total) || 0 };
    }
  } catch { /* unlesbarer Stand: ohne Auswertung */ }
  return out;
}

// ---------- Routen ----------
const routes = [];
const route = (method, pattern, handler) => routes.push({ method, pattern: new RegExp(`^${pattern}$`), handler });

route('GET', '/api/me', (req) => ({
  user: publicUser(currentUser(req)),
  registration: getSetting('registration', 'open'),
}));

route('POST', '/api/register', async (req, res, body) => {
  const mode = getSetting('registration', 'open');
  if (mode === 'closed') fail(403, 'Die Registrierung ist zurzeit geschlossen. Wende dich an Ivan, wenn du ein Konto brauchst.');
  limit(`reg:${clientIp(req)}`, 8, 60 * 60e3);
  if (mode === 'code') {
    const want = Buffer.from(getSetting('code', ''));
    const got = Buffer.from(typeof body.code === 'string' ? body.code.trim() : '');
    if (!want.length || got.length !== want.length || !crypto.timingSafeEqual(got, want)) fail(403, 'Der Einladungscode stimmt nicht.');
  }
  const name = checkName(body.name);
  const pw = checkPassword(body.password, name);
  if (name.toLowerCase() === ADMIN_NAME.toLowerCase() || q.userByName.get(name.toLowerCase())) fail(409, 'Diesen Benutzernamen gibt es schon. Bitte wähle einen anderen.');
  if (q.userCount.get().n >= MAX_USERS) fail(403, 'Zurzeit können keine weiteren Konten angelegt werden.');
  const info = q.insertUser.run(name, name.toLowerCase(), await hashPassword(pw), 'user', 0, now());
  const id = Number(info.lastInsertRowid);
  q.touchUser.run(now(), id);
  startSession(req, res, id);
  return { user: publicUser(q.userById.get(id)) };
});

route('POST', '/api/login', async (req, res, body) => {
  const name = typeof body.name === 'string' ? body.name.trim().normalize('NFKC').toLowerCase() : '';
  const pw = typeof body.password === 'string' ? body.password : '';
  const ipKey = `login:${clientIp(req)}`, nameKey = `login-name:${name}`;
  limit(ipKey, 30, 15 * 60e3);
  limit(nameKey, 10, 15 * 60e3);
  const u = q.userByName.get(name);
  const ok = await verifyPassword(pw.slice(0, 200), u ? u.pw : DUMMY_HASH);
  if (!u || !ok) fail(401, 'Benutzername oder Passwort stimmen nicht.');
  if (u.disabled) fail(403, 'Dieses Konto ist gesperrt. Wende dich an Ivan.');
  unlimit(nameKey);
  q.touchUser.run(now(), u.id);
  startSession(req, res, u.id);
  return { user: publicUser(u) };
});

route('POST', '/api/logout', (req, res) => { endSession(req, res); return { ok: true }; });

route('POST', '/api/password', async (req, res, body) => {
  const u = needUser(req);
  limit(`pw:${u.id}`, 10, 15 * 60e3);
  if (!await verifyPassword(String(body.current ?? '').slice(0, 200), u.pw)) fail(403, 'Das aktuelle Passwort stimmt nicht.');
  const next = checkPassword(body.next, u.name);
  if (next === body.current) fail(400, 'Das neue Passwort muss sich vom alten unterscheiden.');
  q.setPw.run(await hashPassword(next), 0, u.id);
  q.deleteOtherSessions.run(u.id, u.sessionKey);
  return { user: publicUser(q.userById.get(u.id)) };
});

route('DELETE', '/api/me', async (req, res, body) => {
  const u = needUser(req);
  if (u.role === 'admin') fail(400, 'Das Verwaltungskonto kann nicht gelöscht werden.');
  if (!await verifyPassword(String(body.password ?? '').slice(0, 200), u.pw)) fail(403, 'Das Passwort stimmt nicht.');
  q.deleteUser.run(u.id);
  endSession(req, res);
  return { ok: true };
});

route('GET', '/api/progress', (req) => {
  const u = needUser(req);
  const p = q.progress.get(u.id);
  return p ? { data: JSON.parse(p.data), rev: p.rev } : { data: null, rev: 0 };
});

route('PUT', '/api/progress', (req, res, body) => {
  const u = needUser(req);
  const data = body.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail(400, 'Ungültiger Lernstand.');
  const json = JSON.stringify(data);
  if (json.length > 256 * 1024) fail(413, 'Der Lernstand ist zu groß.');
  const { xp, answers } = summarize(data);
  const cur = q.progress.get(u.id);
  if (!cur) { q.insertProgress.run(u.id, json, xp, answers, now()); return { rev: 1 }; }
  // Ein anderes Gerät hat inzwischen gespeichert: Der Client bekommt den neueren Stand zurück.
  if (Number(body.rev) !== cur.rev) fail(409, 'Auf einem anderen Gerät wurde inzwischen weitergelernt.', { data: JSON.parse(cur.data), rev: cur.rev });
  q.updateProgress.run(json, xp, answers, now(), u.id);
  return { rev: cur.rev + 1 };
});

route('DELETE', '/api/progress', (req) => { q.deleteProgress.run(needUser(req).id); return { ok: true }; });

route('POST', '/api/reports', (req, res, body) => {
  const u = currentUser(req);
  limit(`report:${u ? 'u' + u.id : clientIp(req)}`, 20, 60 * 60e3, 'Du hast in kurzer Zeit sehr viele Meldungen geschickt. Bitte warte etwas.');
  const ref = String(body.ref ?? '').slice(0, 120);
  if (!/^[\w./:#-]+$/.test(ref)) fail(400, 'Ungültige Aufgabenreferenz.');
  q.insertReport.run(u?.id ?? null, ref, String(body.question ?? '').slice(0, 600), String(body.note ?? '').trim().slice(0, 1000), now());
  return { ok: true };
});

// ----- Verwaltung -----
route('GET', '/api/admin/users', (req) => {
  needAdmin(req);
  return {
    users: q.users.all().map(r => ({
      id: r.id, name: r.name, role: r.role, disabled: !!r.disabled, mustChange: !!r.must_change,
      created: r.created, lastSeen: r.last_seen, xp: r.xp ?? 0, answers: r.answers ?? 0, learned: r.updated ?? null,
      topics: r.data ? topicMastery(r.data) : {},
    })),
    openReports: q.openReports.get().n,
  };
});

function targetUser(req, id) {
  const me = needAdmin(req);
  const u = q.userById.get(Number(id)) || fail(404, 'Dieses Konto gibt es nicht.');
  if (u.id === me.id || u.role === 'admin') fail(400, 'Das Verwaltungskonto lässt sich hier nicht ändern.');
  return u;
}
route('POST', '/api/admin/users/(\\d+)/reset-password', async (req, res, body, [id]) => {
  const u = targetUser(req, id);
  const password = randomPassword();
  q.setPw.run(await hashPassword(password), 1, u.id);
  q.deleteUserSessions.run(u.id);
  return { password };
});
route('PATCH', '/api/admin/users/(\\d+)', (req, res, body, [id]) => {
  const u = targetUser(req, id);
  if (typeof body.disabled === 'boolean') {
    q.setDisabled.run(body.disabled ? 1 : 0, u.id);
    if (body.disabled) q.deleteUserSessions.run(u.id);
  }
  return { ok: true };
});
route('DELETE', '/api/admin/users/(\\d+)', (req, res, body, [id]) => { q.deleteUser.run(targetUser(req, id).id); return { ok: true }; });
route('DELETE', '/api/admin/users/(\\d+)/progress', (req, res, body, [id]) => { q.deleteProgress.run(targetUser(req, id).id); return { ok: true }; });

route('GET', '/api/admin/reports', (req) => { needAdmin(req); return { reports: q.reports.all().map(r => ({ ...r, done: !!r.done })) }; });
route('PATCH', '/api/admin/reports/(\\d+)', (req, res, body, [id]) => { needAdmin(req); q.setReportDone.run(body.done ? 1 : 0, Number(id)); return { ok: true }; });
route('DELETE', '/api/admin/reports/(\\d+)', (req, res, body, [id]) => { needAdmin(req); q.deleteReport.run(Number(id)); return { ok: true }; });

route('GET', '/api/admin/settings', (req) => { needAdmin(req); return { registration: getSetting('registration', 'open'), code: getSetting('code', '') }; });
route('PUT', '/api/admin/settings', (req, res, body) => {
  needAdmin(req);
  if (!['open', 'code', 'closed'].includes(body.registration)) fail(400, 'Unbekannte Einstellung für die Registrierung.');
  const code = String(body.code ?? '').trim().slice(0, 64);
  if (body.registration === 'code' && code.length < 6) fail(400, 'Der Einladungscode braucht mindestens 6 Zeichen.');
  q.putSetting.run('registration', body.registration);
  q.putSetting.run('code', code);
  return { registration: body.registration, code };
});

// ---------- HTTP ----------
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, 'Die Anfrage ist zu groß.')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!size) return resolve({});
      try { const v = JSON.parse(Buffer.concat(chunks).toString('utf8')); resolve(v && typeof v === 'object' ? v : {}); }
      catch { reject(new HttpError(400, 'Die Anfrage ist kein gültiges JSON.')); }
    });
    req.on('error', reject);
  });
}

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(obj));
}

async function handleApi(req, res, pathname) {
  try {
    if (req.method !== 'GET') {
      // Schutz vor fremden Seiten, die im Namen angemeldeter Nutzer Anfragen schicken (CSRF):
      // Diesen Kopf kann ein fremdes Formular nicht setzen, und SameSite=Lax hält das Cookie zusätzlich zurück.
      if (req.headers['x-requested-with'] !== 'lernstack') fail(403, 'Anfrage abgelehnt.');
      if (!/^application\/json/.test(req.headers['content-type'] || '')) fail(415, 'Anfragen müssen JSON sein.');
    }
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = r.pattern.exec(pathname);
      if (!m) continue;
      const body = req.method === 'GET' ? {} : await readBody(req);
      return send(res, 200, await r.handler(req, res, body, m.slice(1)));
    }
    fail(404, 'Diese Adresse gibt es nicht.');
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message, ...e.extra });
    console.error(new Date().toISOString(), req.method, pathname, e);
    send(res, 500, { error: 'Auf dem Server ist ein Fehler aufgetreten.' });
  }
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
function handleStatic(req, res, pathname) {
  let p = pathname.replace(/^\/v\/[^/]+\//, '/');
  if (p === '/') p = '/index.html';
  const file = path.join(STATIC_DIR, path.normalize(p));
  if (!file.startsWith(STATIC_DIR + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Nicht gefunden'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pathname === '/api/healthz') return send(res, 200, { ok: true });
  if (pathname.startsWith('/api/')) return handleApi(req, res, pathname);
  if (STATIC_DIR && req.method === 'GET') return handleStatic(req, res, pathname);
  res.writeHead(404); res.end();
});

// ---------- Verwaltungskonto beim ersten Start anlegen ----------
async function ensureAdmin() {
  if (q.userByName.get(ADMIN_NAME.toLowerCase())) return;
  const given = process.env.ADMIN_PASSWORD || '';
  const password = given.length >= 10 ? given : randomPassword();
  q.insertUser.run(ADMIN_NAME, ADMIN_NAME.toLowerCase(), await hashPassword(password), 'admin', given.length >= 10 ? 0 : 1, now());
  if (given.length >= 10) { console.log(`Verwaltungskonto „${ADMIN_NAME}“ mit dem Passwort aus ADMIN_PASSWORD angelegt.`); return; }
  if (given) console.log('ADMIN_PASSWORD ist kürzer als 10 Zeichen und wurde deshalb nicht verwendet.');
  const file = path.join(DATA_DIR, 'admin-startpasswort.txt');
  fs.writeFileSync(file, `Benutzername: ${ADMIN_NAME}\nStartpasswort: ${password}\n\nNach der ersten Anmeldung musst du ein eigenes Passwort vergeben. Lösche diese Datei danach.\n`, { mode: 0o600 });
  console.log(`Verwaltungskonto „${ADMIN_NAME}“ angelegt. Das Startpasswort steht in ${file}.`);
}

await ensureAdmin();
server.listen(PORT, () => console.log(`Lernstack-API läuft auf Port ${PORT}${STATIC_DIR ? ` und liefert ${STATIC_DIR} aus` : ''}.`));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => { db.close(); process.exit(0); }));
