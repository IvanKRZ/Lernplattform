# Lernstack – DESIGN.md

Richtung: **Lernwelt.** Helle, runde Oberfläche mit Karten, kräftigem Violett als Markenfarbe und gelben Akzenten für Erfolg und Hervorhebung. Die Seite soll motivieren: dicke Fortschrittsbalken, Pillen als Stand-Anzeige, Buttons mit spürbarer Unterkante.

Zielgruppe: Fachinformatikerinnen und Fachinformatiker in Ausbildung und Umschulung.

## Leitideen

1. **Karten statt Linien.** Inhalte liegen auf weißen Flächen (`--surface`) mit großem Radius und weichem Schatten auf getöntem Grund (`--page`).
2. **Eine Markenfarbe.** Violett (`--brand`) für Buttons, aktive Navigation, Auswahl und Fortschritt. Gelb (`--marker`) für Hervorhebungen, Merksätze und Serien.
3. **Kapitelfarben.** Jedes Thema behält seine Farbe (Kabelfarben nach T568B) als Badge mit Kapitelnummer, als Griffregister am Rand und als Streifen oben auf der Themenseite.
4. **Rückmeldung sofort.** Gedrückte Buttons, wippende richtige Antworten, wackelnde falsche, Balken mit federndem Übergang. Bewegung nur als Antwort auf eine Handlung, `prefers-reduced-motion` wird respektiert.
5. **Abbrechen und Überspringen.** In jedem Durchgang gibt es „Frage überspringen“ (zählt nicht, kein Eintrag im Lernstand) und „Durchgang abbrechen“ (mit Rückfrage, ohne Auswertung).

## Farbe

| Token | Hell | Dunkel | Rolle |
|---|---|---|---|
| `--page` | `#F6F4FF` | `#14112A` | Seitengrund |
| `--surface` | `#FFFFFF` | `#1E1A3A` | Karten, Eingabefelder |
| `--ink` | `#1F1A38` | `#EEEBFF` | Text |
| `--ink-2` / `--ink-3` | `#54507A` / `#6B6790` | `#BDB8E0` / `#9791C0` | Nebentext, Beschriftungen |
| `--field` | `#EFEBFC` | `#181433` | Befehlsausgaben |
| `--line` / `--line-2` | `#D9D3F0` / `#EAE6F8` | `#3A3566` / `#2B2650` | Rahmen, leere Balken |
| `--brand` / `--brand-2` | `#5B3FD6` / `#4A30B8` | `#A794FF` / `#BDAEFF` | Marke, Links, primäre Buttons |
| `--brand-tint` | `#ECE7FF` | `#2D2660` | Hover, aktive Flächen |
| `--on-brand` | `#FFFFFF` | `#1B1240` | Schrift auf Markenfarbe |
| `--marker` / `--marker-soft` | `#FFD23F` / `#FFF3C2` | `#FFD23F` / `#4A3F12` | Hervorhebung, Merksatz |
| `--ok` / `--bad` / `--warn` | `#0F7A3D` / `#C0302A` / `#9A5A00` | `#5ACB8D` / `#FF8A7E` / `#F0B44A` | richtig, falsch, fast sicher |
| `--focus` | `#2F6BFF` | `#8AB4FF` | Fokusring |

Dazu `--shadow-1`, `--shadow-2` (weiche, violett getönte Schatten) und `--backdrop` (Dialog-Hintergrund). Netz- und Bit-Tokens (`--net-*`, `--host-*`, `--grid-line`, `--link-line`, `--pkt`) gehören zur Paketreise und zu den Rechenwegen.

Themenfarben: orange `#E07020`, grün `#2E8B57`, blau `#2D6CDF`, braun `#8A5A3C`, LWL-gelb `#D9A400`, LWL-aqua `#1A9AA0`. Die Schriftfarbe darauf berechnet `inkOn()` in `js/ui.js`.

Beherrschung: Balken aus zehn runden Segmenten plus Wort als Pille („üben“ unter 50 %, „fast sicher“ ab 50 %, „sitzt“ ab 85 %), damit der Stand nicht nur über Farbe erkennbar ist.

Hell und dunkel sind umschaltbar (`[data-theme]`), Start nach Systemeinstellung.

## Typografie

- **Nunito** 400, 700, 800: Überschriften (800) und Fließtext. Abgerundet und freundlich.
- **Atkinson Hyperlegible Mono** 400/600: nur für Werte, die man abschreibt oder vergleicht (IP, Maske, Binär, Befehle) und Eingabefelder von Aufgaben.

Skala (rem): 0.875 · 1.0625 (Text, 17 px) · 1.1875 (Vorspann) · 1.5 (h2) · 2 · 3.25 (h1, fließend). Überschriften 800 mit Zeilenhöhe 1.08 bis 1.15, Text 1.6. Lesetext höchstens 42 rem breit.

## Abstand und Form

4er-Raster: 4, 8, 12, 16, 24, 32, 48, 72. Inhalt höchstens 1120 px. Radius: `--r` 14 px (Buttons in Pillenform 999 px, Antworten, Felder), `--r-s` 10 px, `--r-l` 22 px (Karten). Rahmen von Bedienelementen 2 px.

## Komponenten

- **Abschnitt** (`.sec`): Karte, Überschrift links, Inhalt rechts. Unter 860 px untereinander.
- **Übungskacheln** (`.tiles`, `.tile`): stehen direkt unter dem Seitenkopf von Startseite und Fachseite sowie am Ende jeder Lernseite (`.tiles-s`). Oben eine Grafikfläche im Verlauf der Kapitelfarbe mit großem Icon und zwei hellen Kreisen, darunter Titel, Text und Stand als Pille. Die erste Kachel ist doppelt so breit, bei sechs Kacheln auch die letzte. Hover hebt die Kachel an und kippt das Icon.
- **Inhaltsverzeichnis** (`.toc-list`): Zeilen mit Kapitel-Badge, Titel, Beschreibung, Balken und Stand. Hover in `--brand-tint`.
- **Griffregister** (`.reg`): ab 1240 px fest am linken Rand, darunter als Leiste über dem Seitentitel.
- **Lernseite** (`.learn`): nummerierte Abschnitte mit farbigem Nummern-Badge. `.merke` ist die gelbe Hinweisbox, `.rechnung` der Rechenweg auf Karopapier, Tabellen mit abgerundetem Rahmen und getönter Kopfzeile.
- **Aufgabe** (`.item`): Karte mit Kopfzeile. Antworten (`.opt`) sind große Kacheln mit Tastenzahl. Gewählt: violett. Richtig: grün. Falsch: rot. Übersehen: grün gestrichelt.
- **Durchgang** (`.run-actions`): „Frage überspringen“ als stiller Button, „Durchgang abbrechen“ als roter Umriss-Button, öffnet einen Bestätigungsdialog.
- **Button**: primär violett mit Unterkante, sekundär weiß mit violettem Rahmen, `:active` drückt ihn ein. Löschen rot.
- **Formular** (`.form`, `.field`): Beschriftung über dem Feld, Fokus in Markenfarbe.
- **Dialog** (`dialog.dlg`): ersetzt `confirm()` und `prompt()`.

## Bilder und Icons

Keine Fotos. Icons kommen aus den **Phosphor Icons** (Gewicht duotone, MIT-Lizenz, Lizenztext in `site/icons/LICENSE-phosphor.txt`), eingebettet als SVG-Strings in `site/js/icons.js` und über `currentColor` gefärbt. Netzsymbole in der Paketreise sind einfache Strichzeichnungen auf Karopapier.

## Sprache

Du-Form, ganze Sätze, Fachbegriffe so, wie sie in Prüfung und Betrieb heißen, beim ersten Auftreten erklärt. Buttons sagen, was passiert („Tagesrunde starten“, „Konto löschen“). Fehlermeldungen nennen die Ursache und den nächsten Schritt.
