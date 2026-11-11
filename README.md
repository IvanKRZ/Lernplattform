# Lernstack – Netzwerktechnik für Fachinformatiker

Lernplattform für Fachinformatikerinnen und Fachinformatiker in Ausbildung und Umschulung. Zurzeit ein Fach: Netzwerktechnik mit zehn Themen.

Zwei Teile, beide ohne Build-Schritt und ohne npm-Abhängigkeiten:

- `site/`: die Seite selbst (HTML, CSS, Vanilla-JS als ES-Module), ausgeliefert von nginx.
- `server/server.mjs`: kleine API für Konten, Lernstand und Verwaltung. Node 22 mit eingebautem SQLite (`node:sqlite`), sonst nichts.

Ohne Konto funktioniert alles weiter, der Lernstand liegt dann nur im `localStorage` des Browsers. Mit Konto liegt er auf dem Server und ist auf jedem Gerät derselbe.

## Betrieb

```bash
cd /opt/lernplattform
docker compose up -d          # starten
docker compose logs -f        # Logs
docker compose restart        # nach Konfig-Änderung
```

- Zwei Container: `lernplattform` (nginx, Port `3005` auf dem Host) und `lernplattform-api` (Node, nur intern erreichbar). nginx reicht `/api/` an die API weiter.
- `./site` und `./server` werden read-only gemountet. Inhaltsänderungen an der Seite sind sofort live. Änderungen an `server/` brauchen `docker compose restart api`, das erledigt das Update-Skript.
- Healthchecks: `GET /healthz` (nginx) und `GET /api/healthz` (API).
- Öffentlich über den bestehenden Cloudflare Tunnel: Public Hostname `lernen.ivankrz.de` → `http://10.10.7.60:3005`

### Erster Start: Verwaltungskonto „Ivan“

Beim ersten Start legt die API das Verwaltungskonto `Ivan` an. Es gibt zwei Wege zum Passwort:

1. **Empfohlen:** Vor dem ersten Start in `/opt/lernplattform/.env` ein Passwort mit mindestens 10 Zeichen setzen. Die Datei steht in `.gitignore`.
   ```bash
   echo 'ADMIN_PASSWORD=hier ein langes Passwort' > .env && chmod 600 .env
   ```
2. Ohne `.env` erzeugt die API ein zufälliges Startpasswort und schreibt es nach `data/admin-startpasswort.txt`. Bei der ersten Anmeldung muss es durch ein eigenes ersetzt werden. Danach die Datei löschen.

`ADMIN_PASSWORD` wird nur gelesen, solange es das Konto noch nicht gibt. Später ändert man das Passwort in der Seite unter „Konto“. Passwort des Verwaltungskontos vergessen: Container stoppen, in `data/lernstack.db` die Zeile löschen (`sqlite3 data/lernstack.db "DELETE FROM users WHERE name_lc='ivan'"`), neu starten. Das Konto wird dann wie beim ersten Start neu angelegt, die Lernkonten bleiben erhalten.

### Daten und Sicherung

Alles Veränderliche liegt in `./data` (nicht im Repo): `lernstack.db` mit Konten, Sitzungen, Lernständen, Fehlermeldungen und Einstellungen. Das Update-Skript fasst den Ordner nicht an.

```bash
# konsistente Sicherung im laufenden Betrieb
sqlite3 data/lernstack.db ".backup 'backup-$(date +%F).db'"
```

Ohne `sqlite3` auf dem Host: Container stoppen und den Ordner `data/` kopieren (mit den Dateien `-wal` und `-shm`).

### Konten und Sicherheit

- Registrierung nur mit Benutzername und Passwort, keine E-Mail-Adresse. Deshalb gibt es kein „Passwort vergessen“ per Mail: Ivan setzt in der Verwaltung ein Startpasswort, das bei der nächsten Anmeldung ersetzt werden muss.
- Passwörter: mindestens 10 Zeichen, gespeichert als scrypt-Hash mit eigenem Salt.
- Sitzung: zufälliges Token im Cookie `ls_sid` (`HttpOnly`, `SameSite=Lax`, hinter HTTPS zusätzlich `Secure`), 30 Tage gültig, in der Datenbank nur als SHA-256.
- Schreibende Anfragen brauchen den Kopf `X-Requested-With: lernstack` und JSON als Inhaltstyp (Schutz vor CSRF).
- Begrenzung der Versuche bei Anmeldung, Registrierung und Fehlermeldungen (im Arbeitsspeicher, pro IP beziehungsweise Name).
- Die Registrierung lässt sich in der Verwaltung auf „mit Einladungscode“ oder „geschlossen“ stellen. Das ist sinnvoll, sobald die Seite öffentlich erreichbar ist und nur eine bestimmte Gruppe Konten anlegen soll.

### Verwaltung

Angemeldet als `Ivan` erscheint im Menü „Verwaltung“:

- **Konten:** alle Konten mit Anlagedatum, letzter Aktivität, Antworten und Punkten. Passwort zurücksetzen, sperren und entsperren, löschen.
- **Lernstand der Gruppe:** Anteil richtiger Antworten je Konto und Thema sowie der Durchschnitt. Zeigt, bei welchen Themen es hakt.
- **Fehlermeldungen:** was Nutzer über „Fehler melden“ unter einer Lösung geschickt haben, mit Aufgabenreferenz wie `netzwerktechnik/subnetting/s6`.
- **Registrierung:** offen, mit Einladungscode oder geschlossen.

## Versionierung und Deployment

Das GitHub-Repo [IvanKRZ/Lernplattform](https://github.com/IvanKRZ/Lernplattform) ist die einzige Quelle. Es gibt zwei Kopien davon:

| Wo | Pfad | Aufgabe |
|---|---|---|
| Arbeitsrechner | `D:\Nerdstuff\Coding\lernplattform` | hier wird bearbeitet, dann `git push` |
| Docker-VM | `/opt/lernplattform` | holt sich Änderungen automatisch |

Ablauf einer Änderung: lokal bearbeiten, committen, `git push`. Auf dem Server läuft per cron alle 5 Minuten `scripts/update.sh`. Das Skript holt den neuen Stand von `main`. Inhalte sind sofort live, weil nginx den Ordner `site/` direkt ausliefert. Wenn sich `docker-compose.yml` oder `nginx.conf` geändert haben, werden die Container neu erstellt. Wenn sich nur `server/` geändert hat, wird die API neu gestartet.

Sofort aktualisieren statt auf cron zu warten: `/opt/lernplattform/scripts/update.sh`. Das Log liegt in `/opt/lernplattform/update.log`.

### Cache und Versionierung

Cloudflare ersetzt den Cache-Header von nginx und lässt Browser JS und CSS bis zu 4 Stunden ungeprüft aus dem Cache laden. Damit nach einem Update trotzdem niemand alte Dateien bekommt, verweist `index.html` auf `v/dev/…`. Das Update-Skript ersetzt `dev` durch den Commit-Hash, zum Beispiel `v/7dcb3f7/js/app.js`. nginx liefert jede Datei unter `/v/<beliebig>/` aus dem normalen Pfad aus und erlaubt dafür unbegrenztes Caching. `index.html` selbst wird nie gecacht. Jede neue Version hat also neue Adressen, und alte Stände im Cache spielen keine Rolle mehr.

Neue Dateien, die `index.html` direkt einbindet, müssen deshalb ebenfalls mit `v/dev/` beginnen. Dateien, die per `import` oder `url()` relativ geladen werden, bekommen den Präfix automatisch.

### Lokal testen

Mit Docker: `docker compose up -d` im Projektordner, dann `http://localhost:3005` öffnen.

Ohne Docker reicht Node ab 22.13. Die API liefert dann auch die Seite aus, inklusive der Pfade `/v/…`:

```bash
STATIC_DIR=site DATA_DIR=./data ADMIN_PASSWORD='ein langes Passwort' node server/server.mjs
# http://localhost:3000
```

Ein einfacher Dateiserver wie `python -m http.server` reicht nicht, weil er weder `/v/…` noch `/api/` kennt.

Vor jedem Push:

```bash
node tests/check.mjs   # Inhalte: gültige Antworten, Erklärungen, eindeutige IDs, 600 Aufgaben je Rechen-Generator
node tests/api.mjs     # API: Konten, Sitzungen, Lernstand, Rechte, Verwaltung (eigene temporäre Datenbank)
```

Wichtig: Auf dem Server nichts direkt ändern. Das Update-Skript setzt den Stand hart auf `origin/main` zurück, lokale Änderungen dort gehen verloren.

## Aufbau

```
server/server.mjs      API: Konten, Sitzungen, Lernstand, Fehlermeldungen, Verwaltung (SQLite in ./data)
site/
  index.html, css/style.css
  js/app.js            Router und Lernseiten (Heute, Themen, Thema, Tagesrunde, Einstufung, Klausur, Fortschritt)
  js/views/            Anmelden, Konto, Verwaltung
  js/account.js        angemeldeter Nutzer, js/api.js Anfragen an die API
  js/store.js          Lernstand, Wiederholungstermine, Abgleich mit dem Server
  js/ui.js             DOM-Helfer, Hinweise, Dialoge
  js/gen/netz.js       Aufgaben-Generatoren (Subnetting, Zahlensysteme, PAT, LWL …)
  js/engines/          item (Fragetypen), runner (Quiz/Klausur), games (Zuordnen, Reihenfolge),
                       arcade (Rechentraining), journey (Paketreise), pool (Aufgaben auswählen)
  content/subjects.js  Fächer-Registry
  content/<fach>/      Inhalte je Fach
tests/                 check.mjs (Inhalte), api.mjs (API)
```

## Wie gelernt wird

- **Wiederholung in wachsenden Abständen** (Karteikasten nach Leitner, `store.js`): Jede feste Frage hat ein Fach von 1 bis 5. Eine richtige Antwort schiebt sie ein Fach weiter, sie wird dann nach 1, 3, 7, 14 oder 30 Tagen wieder fällig. Eine falsche Antwort stellt sie zurück in Fach 1, also auf den nächsten Tag. Ab Fach 3 gilt eine Frage als gefestigt. Generierte Rechenaufgaben sind jedes Mal neu und haben keinen Termin.
- **Tagesrunde** (`pool.js`, `dailyItems`): bis zu 12 fällige Fragen aus allen Themen, höchstens 6 neue aus dem ersten noch nicht vollständig gesehenen Thema, dazu 2 Rechenaufgaben.
- **Quiz je Thema**: fällige Fragen zuerst, dann neue, dann die am wenigsten gefestigten.
- **Stand je Thema**: Anteil richtiger Antworten unter den letzten 25, ab 85 % „sitzt“.
- Die Startseite zeigt angemeldeten Nutzern, was heute fällig ist, und schlägt die schwächsten Themen vor.

## Neues Fach hinzufügen

1. Ordner `site/content/<fach>/` mit `index.js` anlegen (Vorlage: `netzwerktechnik/index.js`).
2. Themen nach dem Schema in `netzwerktechnik/teil1.js` anlegen:
   - `color`: Themenfarbe (Kabelfarben aus DESIGN.md), `blurb`: ein Satz, worum es geht, `pruefung`: wo das Thema in der Abschlussprüfung vorkommt (Randspalte)
   - `learn`: Abschnitte der Lernseite `{ h, html }` in ganzen Sätzen. Bausteine: `<div class="merke">` für das Wichtigste, `<div class="rechnung">` für Rechenwege auf Karopapier, normale Tabellen
   - `questions`: `mc` (eine richtige, `answer` = Index), `multi` (`answer` = Index-Array), `tf` (`answer` = true/false), `input` (`accept` = Liste gültiger Eingaben)
   - `pairs`: Zuordnen-Sets, `order`: Reihenfolgen
   - `gens`: IDs von Generatoren aus `js/gen/` (optional)
3. In `content/subjects.js` importieren und mit `status: 'aktiv'` in die Liste eintragen. Die Oberfläche zeigt zurzeit genau ein Fach (`S` in `js/app.js`). Für ein zweites Fach braucht es dort eine Fächerauswahl. `journeys` (Knoten mit `mac: [[Bezeichnung, MAC]]` für die MAC-Anzeige) und `cases` sind optional.

Jede Frage hat eine eindeutige `id`. Über „Fehler melden“ schicken Nutzer eine Meldung mit der Referenz der Aufgabe, zum Beispiel `netzwerktechnik/subnetting/s6`, in die Verwaltung. Damit lässt sich die Frage direkt finden. Die `id` einer Frage nicht nachträglich ändern, sonst verlieren Nutzer ihren Wiederholungstermin dafür.

## Gestaltung

Farben, Schriften und Komponenten stehen in `DESIGN.md`. Texte immer in ganzen, einfachen Sätzen schreiben. Fachbegriffe so verwenden, wie sie in Prüfung und Betrieb heißen, und beim ersten Auftreten erklären. Keine Stichwortketten, keine Pfeile als Satzersatz.

## Prüfung der Generatoren

Die Rechen-Generatoren wurden mit je mehreren hundert Zufallsaufgaben gegen Pythons `ipaddress`-Modul geprüft (Netz-, Broadcast-, Hostadressen, Hostanzahl, Masken, Supernetting, Subnetz-Zuordnung, private Bereiche, Zahlensysteme).
