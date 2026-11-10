# Lernstack – Lernplattform für die FISI-Umschulung

Statische Web-App (HTML/CSS/Vanilla-JS, keine Build-Pipeline, kein Backend), ausgeliefert per nginx im Docker-Container. Fortschritt (XP, Level, Beherrschung, Rekorde) liegt nur im `localStorage` des Browsers.

## Betrieb

```bash
cd /opt/lernplattform
docker compose up -d          # starten
docker compose logs -f        # Logs
docker compose restart        # nach Konfig-Änderung
```

- Port: `3005` auf dem Host → nginx im Container
- Inhalte werden read-only gemountet (`./site`). Inhaltsänderungen sind sofort live, kein Neustart nötig.
- Healthcheck: `GET /healthz`
- Öffentlich über den bestehenden Cloudflare Tunnel: Public Hostname `lernen.ivankrz.de` → `http://10.10.7.60:3005`

## Versionierung und Deployment

Das GitHub-Repo [IvanKRZ/Lernplattform](https://github.com/IvanKRZ/Lernplattform) ist die einzige Quelle. Es gibt zwei Kopien davon:

| Wo | Pfad | Aufgabe |
|---|---|---|
| Arbeitsrechner | `D:\Nerdstuff\Coding\lernplattform` | hier wird bearbeitet, dann `git push` |
| Docker-VM | `/opt/lernplattform` | holt sich Änderungen automatisch |

Ablauf einer Änderung: lokal bearbeiten, committen, `git push`. Auf dem Server läuft per cron alle 5 Minuten `scripts/update.sh`. Das Skript holt den neuen Stand von `main`. Inhalte sind sofort live, weil nginx den Ordner `site/` direkt ausliefert. Nur wenn sich `docker-compose.yml` oder `nginx.conf` geändert haben, wird der Container neu erstellt.

Sofort aktualisieren statt auf cron zu warten: `/opt/lernplattform/scripts/update.sh`. Das Log liegt in `/opt/lernplattform/update.log`.

Wichtig: Auf dem Server nichts direkt ändern. Das Update-Skript setzt den Stand hart auf `origin/main` zurück, lokale Änderungen dort gehen verloren.

## Aufbau

```
site/
  index.html, css/style.css
  js/app.js            Router und Seiten (Start, Fach, Thema, Einstufung, Klausur, Profil)
  js/store.js          Fortschritt im localStorage
  js/ui.js             DOM-Helfer, Toasts, Konfetti
  js/gen/netz.js       Aufgaben-Generatoren (Subnetting, Zahlensysteme, PAT, LWL …)
  js/engines/          item (Fragetypen), runner (Quiz/Klausur), games (Zuordnen, Reihenfolge,
                       Karteikarten), arcade, journey (Paketreise), pool (Aufgaben mischen)
  content/subjects.js  Fächer-Registry
  content/<fach>/      Inhalte je Fach
```

## Neues Fach hinzufügen

1. Ordner `site/content/<fach>/` mit `index.js` anlegen (Vorlage: `netzwerktechnik/index.js`).
2. Themen nach dem Schema in `netzwerktechnik/teil1.js` anlegen:
   - `color`: Themenfarbe (Kabelfarben aus DESIGN.md), `blurb`: ein Satz, worum es geht
   - `learn`: Abschnitte der Lernseite `{ h, html }` in ganzen Sätzen. Bausteine: `<div class="merke">` für das Wichtigste, `<div class="rechnung">` für Rechenwege auf Karopapier, normale Tabellen
   - `questions`: `mc` (eine richtige, `answer` = Index), `multi` (`answer` = Index-Array), `tf` (`answer` = true/false), `input` (`accept` = Liste gültiger Eingaben)
   - `pairs`: Zuordnen-Sets, `order`: Reihenfolgen, `cards`: Karteikarten
   - `gens`: IDs von Generatoren aus `js/gen/` (optional)
3. In `content/subjects.js` importieren und den Platzhalter ersetzen. `journeys` und `cases` sind optional.

Jede Frage hat eine eindeutige `id`. Über „Fehler melden“ kopieren Nutzer eine Referenz wie `netzwerktechnik/subnetting/s6`, mit der sich die Frage direkt finden lässt.

## Gestaltung

Farben, Schriften und Komponenten stehen in `DESIGN.md`. Texte immer in ganzen, einfachen Sätzen schreiben, verständlich auch ohne Vorwissen. Keine Stichwortketten, keine Pfeile als Satzersatz.

## Prüfung der Generatoren

Die Rechen-Generatoren wurden mit je mehreren hundert Zufallsaufgaben gegen Pythons `ipaddress`-Modul geprüft (Netz-, Broadcast-, Hostadressen, Hostanzahl, Masken, Supernetting, Subnetz-Zuordnung, private Bereiche, Zahlensysteme).
