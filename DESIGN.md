# Lernstack – DESIGN.md

Richtung: **Fachbuch.** Die Seite sieht aus wie ein gut gesetztes Tabellenbuch, nicht wie eine App aus Karten. Weiße Seite, schwarze Schrift, Linien statt Kästen. Farbe kommt nur an zwei Stellen vor: an den Themenreitern (Kabelfarben nach T568B) und als gelber Textmarker.

Zielgruppe: Fachinformatikerinnen und Fachinformatiker in Ausbildung und Umschulung. Sie kennen Tabellenbuch, Prüfungsbogen und Karopapier, daran lehnt sich die Gestaltung an.

## Leitideen

1. **Linien statt Kästen.** Keine Karten, keine Schatten, keine Verläufe. Abschnitte trennt eine 2 px starke schwarze Linie, Zeilen in Listen eine dünne graue.
2. **Griffregister.** Jedes Thema hat eine Kapitelnummer und eine Farbe. Der Reiter erscheint in Listen als Quadrat mit Nummer und auf Themenseiten als Register am linken Seitenrand, wie die Daumenmarken eines Tabellenbuchs.
3. **Textmarker.** Gelb markiert, was gerade wichtig oder aktiv ist: Merksätze, die ausgewählte Antwort, der aktuelle Menüpunkt, Hover auf Links und Buttons, Lerntage.
4. **Randspalte.** Auf Übersichtsseiten steht die Abschnittsüberschrift links in einer schmalen Spalte, der Inhalt rechts daneben. Auf Themenseiten steht rechts die Randspalte mit Übungen, Stand und Prüfungsbezug.
5. **Prüfungsbogen.** Aufgaben haben eine Kopfzeile mit Nummer, Antwortzeilen mit Kästchen und keinerlei Schmuck.

## Farbe

| Token | Hell | Dunkel | Rolle |
|---|---|---|---|
| `--page` | `#FFFFFF` | `#15181B` | Seite |
| `--ink` | `#14171A` | `#ECEEF0` | Text, starke Linien, primäre Buttons |
| `--ink-2` | `#4A525B` | `#B3BAC2` | Nebentext |
| `--ink-3` | `#69727D` | `#8E96A0` | Beschriftungen |
| `--field` | `#F1F2F3` | `#1F2428` | Befehlsausgaben |
| `--line` / `--line-2` | `#CFD4D9` / `#E6E9EC` | `#3B424A` / `#2A3036` | dünne Linien, leere Balken |
| `--marker` | `#FFE45C` | `#FFE45C` | Textmarker (Schrift darauf immer `#14171A`) |
| `--marker-soft` | `#FFF5BF` | `#40390F` | Merksatz, gewählte Antwort |
| `--ok` | `#17703C` | `#5ACB8D` | richtig, „sitzt“ |
| `--bad` | `#B42E24` | `#FF8A7E` | falsch, „üben“, Löschen |
| `--warn` | `#8A5600` | `#F0B44A` | „fast sicher“ |
| `--focus` | `#1D5FD0` | `#8AB4FF` | Fokusring, Ziel-MAC in der Paketreise |

Themenfarben (Kabelpaare nach T568B, plus LWL): orange `#E07020`, grün `#2E8B57`, blau `#2D6CDF`, braun `#8A5A3C`, LWL-gelb `#D9A400`, LWL-aqua `#1A9AA0`. Sie stehen nur in Reitern, Kapitelnummern und der Unterstreichung der Abschnittsnummern, nie als Fläche hinter Text. Die Schriftfarbe auf einem Reiter berechnet `inkOn()` in `js/ui.js` aus der Helligkeit.

Es gibt keine eigene Akzentfarbe für Links und Buttons. Links sind schwarz und unterstrichen, primäre Buttons schwarz gefüllt, beide werden bei Hover gelb.

Beherrschung: zehnteiliger Balken plus Wort, damit es nicht nur über Farbe erkennbar ist. „üben“ (< 50 %), „fast sicher“ (50–84 %), „sitzt“ (≥ 85 %).

Hell und dunkel sind umschaltbar (`[data-theme]`), Start nach Systemeinstellung.

## Typografie

- **Barlow Semi Condensed** 600/700: Überschriften, Kapitelnummern, Zeilentitel. DIN-artig, erinnert an Gerätebeschriftung.
- **Atkinson Hyperlegible** 400/700: Fließtext. Unterscheidet l/I/1 und O/0 klar, wichtig bei IP-Adressen.
- **Atkinson Hyperlegible Mono** 400/600: nur für Werte, die man abschreibt oder vergleicht (IP, Maske, Binär, Befehle), und für Eingabefelder von Aufgaben.

Skala (rem): 0.875 · 1.0625 (Text, 17 px) · 1.1875 (Vorspann) · 1.5 (h2) · 2 · 3.25 (h1, fließend). Überschriften 700 mit Zeilenhöhe 1.02 bis 1.1, Text 1.6. Lesetext höchstens 42 rem breit.

Keine Großbuchstaben-Labels, keine Mittelpunkte als Trenner, keine Pfeile in Buttons, keine Emojis, keine Zeile „Label über der Überschrift“. Nummern stehen nur dort, wo wirklich eine Reihenfolge vorliegt: Kapitel, Abschnitte (2.3), Arbeitsschritte.

## Abstand und Form

4er-Raster: 4, 8, 12, 16, 24, 32, 48, 72. Inhalt höchstens 1120 px, linksbündig. Randspalte für Abschnittsüberschriften 220 px.
Radius überall 2 px. Rahmen von Bedienelementen 1,5 px. Schatten nur unter Hinweisen (Toasts).

## Komponenten

- **Abschnitt** (`.sec`): Linie oben, Überschrift mit kurzer Erklärung in der linken Spalte, Inhalt rechts. Unter 860 px untereinander.
- **Inhaltsverzeichnis** (`.toc-list`): Reiter mit Kapitelnummer, Titel, ein Satz Beschreibung, rechts Balken und Stand. `is-compact` ohne Beschreibung.
- **Übungsformen** (`.modes`): dreispaltige Zeilen aus Name, Beschreibung und eigenem Stand.
- **Griffregister** (`.reg`): ab 1240 px fest am linken Rand, darunter als waagerechte Leiste über dem Seitentitel.
- **Lernseite** (`.learn`): nummerierte Abschnitte. `.merke` ist der gelb angestrichene Merksatz, `.rechnung` der Rechenweg auf Karopapier (5-mm-Raster), Tabellen haben eine starke Linie oben und dünne Zeilenlinien.
- **Aufgabe** (`.item`): Linie oben, Kopfzeile mit Nummer, Thema und Aufgabenart. Antwortzeilen (`.opt`) mit Kästchen für die Tastenzahl. Gewählt: gelb. Richtig: grün. Falsch: rot. Übersehen: grün gestrichelt.
- **Lerntage** (`.week`): 14 Kästchen, gelb gefüllt je nach Zahl der Antworten.
- **Button**: primär schwarz gefüllt, sekundär mit schwarzem Rahmen, Hover immer gelb. Löschen rot.
- **Formular** (`.form`, `.field`): Beschriftung über dem Feld, Hinweis darunter, Fehler als roter Satz über dem Button.
- **Dialog** (`dialog.dlg`): ersetzt `confirm()` und `prompt()`.

## Bewegung

Nur als Antwort auf eine Handlung: Fortschrittsbalken, Paket wandert, falsche Zuordnung wackelt, Register klappt bei Hover auf. Kein Konfetti, keine Einblendungen beim Laden. `prefers-reduced-motion` wird respektiert.

## Bilder und Icons

Keine Fotos, keine Icon-Bibliothek, keine Illustrationen. Netzsymbole in der Paketreise sind einfache Strichzeichnungen auf Karopapier.

## Sprache

Du-Form, ganze Sätze, Fachbegriffe so, wie sie in Prüfung und Betrieb heißen, beim ersten Auftreten erklärt. Buttons sagen, was passiert („Tagesrunde starten“, „Konto löschen“). Fehlermeldungen nennen die Ursache und den nächsten Schritt.
