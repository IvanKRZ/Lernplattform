// Verwaltung: Konten, Lernstand der Gruppe, Fehlermeldungen, Registrierung
import { h, add, clear, toast, dialog, inkOn } from '../ui.js';
import { api } from '../api.js';

const date = ts => ts ? new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'nie';
function ago(ts) {
  if (!ts) return 'nie';
  const d = Math.floor((Date.now() - ts) / 864e5);
  return d <= 0 ? 'heute' : d === 1 ? 'gestern' : d < 31 ? `vor ${d} Tagen` : date(ts);
}
const pct = v => `${Math.round(v * 100)} %`;
const level = v => v >= 0.85 ? 'ok' : v >= 0.5 ? 'mid' : 'bad';

export async function viewAdmin(app, subject) {
  clear(app);
  const body = h('div', {}, h('p', { class: 'muted' }, 'Lädt …'));
  const tabs = [['konten', 'Konten'], ['gruppe', 'Lernstand der Gruppe'], ['meldungen', 'Fehlermeldungen'], ['einstellungen', 'Registrierung']];
  let active = 'konten';
  const tabBar = h('div', { class: 'tabs', role: 'tablist' });
  add(app, h('div', { class: 'page-head' }, h('h1', {}, 'Verwaltung')), tabBar, body);

  let data = { users: [], openReports: 0 };
  const load = async () => { data = await api('GET', '/api/admin/users'); };
  const guard = fn => async (...args) => { try { await fn(...args); } catch (e) { toast(e.message, 'warn', 5000); } };

  function drawTabs() {
    clear(tabBar).append(...tabs.map(([id, label]) => h('button', {
      role: 'tab', type: 'button', 'aria-selected': id === active,
      onclick: () => { active = id; drawTabs(); show(); },
    }, label, id === 'meldungen' && data.openReports ? h('span', { class: 'count' }, data.openReports) : null)));
  }
  const show = guard(async () => {
    if (active === 'konten') { await load(); drawTabs(); users(); }
    if (active === 'gruppe') { await load(); group(); }
    if (active === 'meldungen') await reports();
    if (active === 'einstellungen') await settings();
  });

  // ----- Konten -----
  function users() {
    const learners = data.users.filter(u => u.role !== 'admin');
    const active7 = learners.filter(u => u.lastSeen && Date.now() - u.lastSeen < 7 * 864e5).length;
    clear(body).append(
      h('p', { class: 'muted' }, `${learners.length} ${learners.length === 1 ? 'Lernkonto' : 'Lernkonten'}, davon ${active7} in den letzten sieben Tagen aktiv.`),
      h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl' },
        h('thead', {}, h('tr', {}, ['Name', 'Angelegt', 'Zuletzt aktiv', 'Antworten', 'Punkte', 'Status', ''].map(t => h('th', {}, t)))),
        h('tbody', {}, data.users.map(u => h('tr', { class: u.disabled ? 'is-off' : '' },
          h('th', {}, u.name),
          h('td', {}, date(u.created)),
          h('td', {}, ago(u.lastSeen)),
          h('td', { class: 'num' }, u.answers),
          h('td', { class: 'num' }, u.xp),
          h('td', {}, u.role === 'admin' ? 'Verwaltung' : u.disabled ? 'gesperrt' : u.mustChange ? 'Startpasswort offen' : 'aktiv'),
          h('td', { class: 'acts' }, u.role === 'admin' ? null : [
            h('button', { class: 'btn-link', onclick: () => resetPassword(u) }, 'Passwort zurücksetzen'),
            h('button', { class: 'btn-link', onclick: guard(async () => { await api('PATCH', `/api/admin/users/${u.id}`, { disabled: !u.disabled }); toast(u.disabled ? `${u.name} ist wieder freigeschaltet.` : `${u.name} ist gesperrt.`); show(); }) }, u.disabled ? 'Entsperren' : 'Sperren'),
            h('button', { class: 'btn-link danger', onclick: () => removeUser(u) }, 'Löschen'),
          ]),
        ))),
      )),
    );
  }
  function resetPassword(u) {
    dialog({
      title: `Passwort von ${u.name} zurücksetzen?`,
      text: 'Es wird ein Startpasswort erzeugt, das du weitergibst. Alle Sitzungen des Kontos werden beendet. Bei der nächsten Anmeldung muss ein eigenes Passwort vergeben werden.',
      submit: 'Startpasswort erzeugen',
      async onSubmit() {
        const r = await api('POST', `/api/admin/users/${u.id}/reset-password`, {});
        setTimeout(() => dialog({
          title: `Startpasswort für ${u.name}`,
          text: h('div', {}, h('p', {}, 'Dieses Passwort wird nur jetzt angezeigt. Gib es persönlich weiter, nicht über einen Gruppenchat.'), h('p', { class: 'secret mono' }, r.password)),
          submit: 'Kopieren und schließen', cancel: 'Schließen',
          async onSubmit() { try { await navigator.clipboard.writeText(r.password); toast('Startpasswort kopiert.'); } catch { /* dann eben abtippen */ } },
        }), 50);
        show();
      },
    });
  }
  function removeUser(u) {
    dialog({
      title: `Konto ${u.name} löschen?`, danger: true, submit: 'Konto löschen',
      text: `Das Konto und der gesamte Lernstand (${u.answers} Antworten) werden endgültig gelöscht.`,
      async onSubmit() { await api('DELETE', `/api/admin/users/${u.id}`, {}); toast(`Konto ${u.name} gelöscht.`); show(); },
    });
  }

  // ----- Lernstand der Gruppe: wo hakt es? -----
  function group() {
    const learners = data.users.filter(u => u.role !== 'admin' && Object.keys(u.topics).length);
    const key = t => `${subject.id}/${t.id}`;
    const avg = t => { const v = learners.map(u => u.topics[key(t)]?.m).filter(x => x != null); return v.length ? { m: v.reduce((a, b) => a + b, 0) / v.length, n: v.length } : null; };
    if (!learners.length) return void clear(body).append(h('p', { class: 'muted' }, 'Noch hat niemand genug Fragen beantwortet. Die Auswertung erscheint, sobald ein Konto zu einem Thema mindestens drei Antworten hat.'));
    clear(body).append(
      h('p', { class: 'muted' }, 'Anteil richtiger Antworten unter den letzten 25 je Thema. Die erste Zeile ist der Durchschnitt über alle Konten mit Daten zum Thema. Leere Felder: noch nicht geübt.'),
      h('div', { class: 'tbl-wrap' }, h('table', { class: 'tbl heat' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Konto'), subject.topics.map((t, i) => h('th', { title: t.title }, h('span', { class: 'tab', style: { '--c': t.color, '--on': inkOn(t.color) } }, i + 1))))),
        h('tbody', {},
          h('tr', { class: 'avg' }, h('th', {}, 'Durchschnitt'), subject.topics.map(t => { const a = avg(t); return h('td', { class: a ? `lv-${level(a.m)}` : '', title: a ? `${t.title}: ${a.n} Konten` : t.title }, a ? pct(a.m) : ''); })),
          learners.map(u => h('tr', {}, h('th', {}, u.name), subject.topics.map(t => { const x = u.topics[key(t)]; return h('td', { class: x ? `lv-${level(x.m)}` : '', title: x ? `${t.title}: ${x.n} Antworten` : t.title }, x ? pct(x.m) : ''); }))),
        ),
      )),
      h('ol', { class: 'heat-legend' }, subject.topics.map(t => h('li', {}, t.title))),
    );
  }

  // ----- Fehlermeldungen -----
  async function reports() {
    const { reports } = await api('GET', '/api/admin/reports');
    data.openReports = reports.filter(r => !r.done).length; drawTabs();
    if (!reports.length) return void clear(body).append(h('p', { class: 'muted' }, 'Keine Meldungen. Nutzer schicken sie über „Fehler melden“ unter jeder Lösung.'));
    clear(body).append(h('ul', { class: 'reports' }, reports.map(r => h('li', { class: r.done ? 'is-done' : '' },
      h('p', { class: 'rep-meta' }, h('span', { class: 'mono' }, r.ref), ` von ${r.user || 'Gast'} am ${date(r.created)}`, r.done ? ', erledigt' : ''),
      r.question ? h('p', { class: 'rep-q' }, r.question) : null,
      h('p', { class: 'rep-note' }, r.note),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: guard(async () => { await api('PATCH', `/api/admin/reports/${r.id}`, { done: !r.done }); show(); }) }, r.done ? 'Wieder öffnen' : 'Als erledigt markieren'),
        h('button', { class: 'btn-link danger', onclick: guard(async () => { await api('DELETE', `/api/admin/reports/${r.id}`, {}); show(); }) }, 'Löschen')),
    ))));
  }

  // ----- Registrierung -----
  async function settings() {
    const s = await api('GET', '/api/admin/settings');
    const err = h('p', { class: 'form-error', role: 'alert' });
    const code = h('input', { id: 'f-code', type: 'text', value: s.code, maxlength: 64, autocomplete: 'off', spellcheck: 'false' });
    const codeField = h('div', { class: 'field' }, h('label', { for: 'f-code' }, 'Einladungscode'), code, h('small', {}, 'Mindestens 6 Zeichen. Den Code gibst du an die Leute weiter, die ein Konto anlegen sollen.'));
    const opts = [['open', 'Offen', 'Jeder kann ein Konto anlegen.'], ['code', 'Mit Einladungscode', 'Ein Konto kann nur anlegen, wer den Code kennt.'], ['closed', 'Geschlossen', 'Niemand kann ein neues Konto anlegen. Bestehende Konten funktionieren weiter.']];
    const radios = opts.map(([v, label, text]) => h('label', { class: 'choice' },
      h('input', { type: 'radio', name: 'reg', value: v, checked: v === s.registration, onchange: sync }), h('span', {}, h('b', {}, label), h('span', {}, text))));
    function sync() { codeField.hidden = body.querySelector('input[name=reg]:checked')?.value !== 'code'; }
    clear(body).append(h('form', { class: 'form', onsubmit: async e => {
      e.preventDefault(); err.textContent = '';
      try {
        await api('PUT', '/api/admin/settings', { registration: body.querySelector('input[name=reg]:checked').value, code: code.value });
        toast('Einstellung gespeichert.');
      } catch (ex) { err.textContent = ex.message; }
    } },
      h('fieldset', { class: 'choices' }, h('legend', {}, 'Wer darf ein Konto anlegen?'), radios),
      codeField, err,
      h('button', { class: 'btn btn-primary', type: 'submit' }, 'Einstellung speichern'),
    ));
    sync();
  }

  drawTabs();
  show();
}
