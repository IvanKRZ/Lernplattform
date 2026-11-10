// Anmelden, Konto anlegen, Konto verwalten
import { h, add, clear, toast, dialog } from '../ui.js';
import * as account from '../account.js';

const PW_HINT = 'Mindestens 10 Zeichen. Ein Satz aus mehreren Wörtern ist sicherer und leichter zu merken als ein kurzes Passwort mit Sonderzeichen.';

// Formular mit Fehlerzeile. onSubmit bekommt die Werte und darf einen Fehler werfen.
function form({ fields, submit, onSubmit }) {
  const err = h('p', { class: 'form-error', role: 'alert' });
  const btn = h('button', { class: 'btn btn-primary btn-lg', type: 'submit' }, submit);
  const inputs = Object.fromEntries(fields.map(f => [f.name, h('input', {
    id: `f-${f.name}`, name: f.name, type: f.type || 'text', autocomplete: f.autocomplete, required: true,
    autocapitalize: 'none', spellcheck: 'false', maxlength: f.maxlength || 200, 'aria-describedby': f.hint ? `h-${f.name}` : null,
  })]));
  const el = h('form', { class: 'form', novalidate: true, onsubmit: async e => {
    e.preventDefault();
    const values = Object.fromEntries(fields.map(f => [f.name, inputs[f.name].value]));
    const missing = fields.find(f => !values[f.name]);
    if (missing) { err.textContent = `Bitte fülle das Feld „${missing.label}“ aus.`; inputs[missing.name].focus(); return; }
    btn.disabled = true; err.textContent = '';
    try { await onSubmit(values); }
    catch (ex) { err.textContent = ex.message; btn.disabled = false; }
  } },
    fields.map(f => h('div', { class: 'field' },
      h('label', { for: `f-${f.name}` }, f.label),
      inputs[f.name],
      f.hint ? h('small', { id: `h-${f.name}` }, f.hint) : null)),
    err,
    btn,
  );
  setTimeout(() => inputs[fields[0].name].focus(), 30);
  return el;
}

function greet(result, name) {
  if (result === 'adopted') toast(`Angemeldet als ${name}. Dein bisheriger Stand aus diesem Browser wurde ins Konto übernommen.`, 'info', 5000);
  else toast(`Angemeldet als ${name}.`);
}

export function viewLogin(app) {
  clear(app);
  if (!account.isAvailable()) return unavailable(app);
  add(app, h('div', { class: 'narrow' },
    h('h1', {}, 'Anmelden'),
    form({
      submit: 'Anmelden',
      fields: [
        { name: 'name', label: 'Benutzername', autocomplete: 'username', maxlength: 24 },
        { name: 'password', label: 'Passwort', type: 'password', autocomplete: 'current-password' },
      ],
      async onSubmit({ name, password }) { greet(await account.login(name.trim(), password), account.current().name); },
    }),
    h('p', { class: 'form-alt' }, account.registrationMode() === 'closed' ? 'Neue Konten legt zurzeit nur Ivan an.' : ['Noch kein Konto? ', h('a', { href: '#/registrieren' }, 'Konto anlegen')]),
    h('p', { class: 'small muted' }, 'Passwort vergessen? Lernstack kennt keine E-Mail-Adresse von dir und kann deshalb keinen Link schicken. Sprich Ivan an, er setzt dein Passwort zurück.'),
  ));
}

export function viewRegister(app) {
  clear(app);
  if (!account.isAvailable()) return unavailable(app);
  const mode = account.registrationMode();
  if (mode === 'closed') {
    return add(app, h('div', { class: 'narrow' },
      h('h1', {}, 'Konto anlegen'),
      h('p', { class: 'lead' }, 'Die Registrierung ist zurzeit geschlossen. Wende dich an Ivan, wenn du ein Konto brauchst.'),
      h('p', {}, h('a', { href: '#/anmelden' }, 'Zur Anmeldung'))));
  }
  add(app, h('div', { class: 'narrow' },
    h('h1', {}, 'Konto anlegen'),
    h('p', { class: 'lead' }, 'Mit Konto wird dein Lernstand gespeichert und ist auf jedem Gerät derselbe.'),
    form({
      submit: 'Konto anlegen',
      fields: [
        { name: 'name', label: 'Benutzername', autocomplete: 'username', maxlength: 24, hint: '3 bis 24 Zeichen. Ivan sieht diesen Namen in der Verwaltung, wähl also einen, an dem er dich erkennt.' },
        { name: 'password', label: 'Passwort', type: 'password', autocomplete: 'new-password', hint: PW_HINT },
        { name: 'repeat', label: 'Passwort wiederholen', type: 'password', autocomplete: 'new-password' },
        ...(mode === 'code' ? [{ name: 'code', label: 'Einladungscode', hint: 'Den Code bekommst du von Ivan.', maxlength: 64 }] : []),
      ],
      async onSubmit({ name, password, repeat, code }) {
        if (password !== repeat) throw new Error('Die beiden Passwörter stimmen nicht überein.');
        greet(await account.register(name.trim(), password, code), account.current().name);
      },
    }),
    h('p', { class: 'form-alt' }, 'Schon ein Konto? ', h('a', { href: '#/anmelden' }, 'Anmelden')),
    stored(),
  ));
}

// Was gespeichert wird, in klaren Worten
function stored() {
  return h('div', { class: 'stored' },
    h('h2', {}, 'Was gespeichert wird'),
    h('ul', { class: 'prose-list' },
      h('li', {}, 'Dein Benutzername und dein Passwort. Das Passwort liegt nur als Hash (scrypt) vor und lässt sich nicht zurückrechnen.'),
      h('li', {}, 'Dein Lernstand: Punkte, richtige und falsche Antworten je Thema, Wiederholungstermine und Bestwerte.'),
      h('li', {}, 'Wann du das Konto angelegt hast und wann du zuletzt aktiv warst.'),
    ),
    h('p', { class: 'small muted' }, 'Keine E-Mail-Adresse, kein Tracking, keine Weitergabe. Ivan sieht als Verwalter deinen Namen und deinen Lernstand je Thema. Dein Konto kannst du jederzeit selbst löschen, alle Daten dazu werden dann entfernt.'),
  );
}

function unavailable(app) {
  add(app, h('div', { class: 'narrow' },
    h('h1', {}, 'Konten sind gerade nicht erreichbar'),
    h('p', { class: 'lead' }, 'Der Server für die Anmeldung antwortet nicht. Du kannst ohne Konto weiterlernen, dein Stand bleibt dann in diesem Browser.'),
    h('p', {}, h('a', { href: '#/' }, 'Zur Startseite'))));
}

const passwordFields = [
  { name: 'current', label: 'Aktuelles Passwort', type: 'password', autocomplete: 'current-password' },
  { name: 'next', label: 'Neues Passwort', type: 'password', autocomplete: 'new-password', hint: PW_HINT },
  { name: 'repeat', label: 'Neues Passwort wiederholen', type: 'password', autocomplete: 'new-password' },
];
async function submitPassword({ current, next, repeat }) {
  if (next !== repeat) throw new Error('Die beiden neuen Passwörter stimmen nicht überein.');
  await account.changePassword(current, next);
  toast('Passwort geändert. Auf anderen Geräten musst du dich neu anmelden.', 'info', 4500);
}

// Nach dem Zurücksetzen durch die Verwaltung (oder beim ersten Start des Verwaltungskontos)
export function viewForcedPassword(app, { done }) {
  clear(app);
  add(app, h('div', { class: 'narrow' },
    h('h1', {}, 'Vergib ein eigenes Passwort'),
    h('p', { class: 'lead' }, 'Du hast dich mit einem Startpasswort angemeldet. Bevor es weitergeht, ersetzt du es durch ein eigenes.'),
    form({
      submit: 'Passwort speichern',
      fields: [{ ...passwordFields[0], label: 'Startpasswort' }, ...passwordFields.slice(1)],
      async onSubmit(v) { await submitPassword(v); done(); },
    }),
    h('p', { class: 'form-alt' }, h('button', { class: 'btn-link', onclick: () => account.logout() }, 'Abmelden')),
  ));
}

export function viewAccount(app) {
  clear(app);
  const u = account.current();
  const pwBox = h('div', {});
  const showPw = () => clear(pwBox).append(form({
    submit: 'Passwort ändern', fields: passwordFields,
    async onSubmit(v) { await submitPassword(v); clear(pwBox).append(pwButton()); },
  }));
  const pwButton = () => h('button', { class: 'btn', onclick: showPw }, 'Passwort ändern');
  pwBox.append(pwButton());
  add(app, h('div', { class: 'narrow' },
    h('h1', {}, 'Konto'),
    h('p', { class: 'lead' }, 'Angemeldet als ', h('b', {}, u.name), u.role === 'admin' ? ' (Verwaltung).' : '.'),
    h('div', { class: 'row' }, h('button', { class: 'btn btn-primary', onclick: async () => { await account.logout(); toast('Abgemeldet.'); location.hash = '#/'; } }, 'Abmelden'), h('a', { class: 'btn', href: '#/profil' }, 'Fortschritt ansehen')),
    h('h2', { class: 'sub' }, 'Passwort'),
    pwBox,
    stored(),
    u.role === 'admin' ? null : [
      h('h2', { class: 'sub' }, 'Konto löschen'),
      h('p', {}, 'Löscht dein Konto mit dem gesamten Lernstand vom Server. Das lässt sich nicht rückgängig machen.'),
      h('button', { class: 'btn btn-danger-quiet', onclick: () => dialog({
        title: 'Konto endgültig löschen?', text: `Das Konto „${u.name}“ und der gesamte Lernstand werden gelöscht. Gib zur Bestätigung dein Passwort ein.`,
        fields: [{ name: 'password', label: 'Passwort', type: 'password', autocomplete: 'current-password' }],
        submit: 'Konto löschen', danger: true,
        async onSubmit({ password }) { await account.deleteAccount(password); toast('Dein Konto wurde gelöscht.'); location.hash = '#/'; },
      }) }, 'Konto löschen'),
    ],
  ));
}
