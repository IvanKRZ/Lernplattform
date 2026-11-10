# Lernstack – DESIGN.md

Richtung: **Arbeitsheft.** Ruhig, gut lesbar, mit Bezug zum Fach: Themenfarben nach den Kabelpaaren von T568B, Karopapier für Rechenwege. Hell und dunkel umschaltbar. Keine Schmuckelemente.

Grundlage: eigene Entscheidung aus dem Fachgebiet (Netzwerktechnik, Umschulung, unterschiedliche Vorkenntnisse). Nicht aus Vergleich mit echten Websites abgeleitet.

## Farbe

| Token | Wert | Rolle |
|---|---|---|
| `--paper` | `#F2F4F6` | Seitenhintergrund (kühles Grau, kein Creme) |
| `--sheet` | `#FFFFFF` | Arbeitsblatt: Aufgaben, Lernseiten |
| `--ink` | `#16202B` | Fließtext, Überschriften |
| `--ink-2` | `#4A5866` | Nebentext |
| `--rule` | `#D5DBE1` | Linien, Rahmen |
| `--primary` | `#1F5FBF` | Buttons, Links, Fokus (T568B-Paar blau) |
| `--ok` | `#1F8A4C` | richtig, Link-LED an |
| `--bad` | `#C2352B` | falsch |
| `--warn` | `#B26B00` | Hinweis, Tipp |

Themenfarben (Kabelpaare nach T568B, plus LWL): orange `#E07020`, grün `#2E8B57`, blau `#2D6CDF`, braun `#8A5A3C`, LWL-gelb `#D9A400`, LWL-aqua `#1A9AA0`. Sie markieren nur die Zugehörigkeit eines Themas (Farbmarke in der Themenliste, Kante der Lernseite), nie Flächen.

Beherrschung: zehnteiliger Balken plus Wort, damit es nicht nur über Farbe erkennbar ist. „üben“ (< 50 %, rot), „fast sicher“ (50–84 %, gelb), „sitzt“ (≥ 85 %, grün).

**Dunkler Modus** (`[data-theme="dark"]`): paper `#11161C`, sheet `#1A2129`, ink `#E6EBF0`, ink-2 `#A9B4BF`, rule `#33404C`, primary `#6EA4FF` mit dunkler Schrift auf Buttons, ok `#4CC67F`, bad `#FF7A6E`, warn `#F0B44A`. Start nach Systemeinstellung, Umschalter oben rechts, Wahl wird im Browser gespeichert.

## Typografie

- **Barlow Semi Condensed** 600/700: Überschriften und kurze Beschriftungen. DIN-artig, erinnert an Gerätebeschriftung.
- **Atkinson Hyperlegible** 400/700: Fließtext. Für Lesbarkeit entworfen, klare Unterscheidung von l/I/1 und O/0, wichtig bei IPs.
- **Atkinson Hyperlegible Mono** 400/600: nur für Werte, die man abschreibt oder vergleicht (IP, Maske, Binär, Befehle).

Skala (rem): 0.875 · 1 (Text, 17 px) · 1.125 · 1.375 · 1.75 · 2.375 · 3.25. Zeilenhöhe Text 1.6, Überschriften 1.15. Textbreite max. 68 Zeichen.

Keine Großbuchstaben-Labels, keine Mittelpunkte als Trenner, keine Pfeile in Buttons, keine Emojis.

## Abstand und Form

4er-Raster: 4, 8, 12, 16, 24, 32, 48, 72. Inhalt max. 1080 px, Lesetext max. 68ch.
Radius: 4 px (Eingaben, Buttons), 8 px (Blätter). Ein Schatten nur für das Arbeitsblatt: `0 1px 0 #D5DBE1, 0 8px 24px -16px rgba(22,32,43,.25)`.

## Komponenten

- **Button primär**: blau, weiße Schrift. **Sekundär**: weiß mit Rahmen. **Leise**: nur Text, unterstrichen bei Hover. Fokus: 3 px blauer Ring.
- **Arbeitsblatt** (`.sheet`): weiß, Rand links in Themenfarbe. Enthält Aufgaben, Lernseiten, Ergebnisse.
- **Karopapier** (`.grid-paper`): 5-mm-Raster, nur für Rechenwege und Bit-Darstellungen.
- **Themenliste** (`.tlist`): eine Zeile pro Thema oder Fach mit Farbmarke, Titel, einem Satz Beschreibung und Fortschrittsbalken. Startseite, Fachseite, Einstufung, Fortschritt.
- **Merke-Kasten**: einziger hervorgehobener Kasten in Lernseiten, linke Linie, kein Hintergrundverlauf.
- **Antwortoptionen**: Zeilen mit Rahmen, Tastenzahl dezent links.

## Bewegung

Nur als Reaktion: Feedback nach einer Antwort, Karte umdrehen, Paket wandert. `prefers-reduced-motion` wird respektiert.

## Bilder und Icons

Keine Fotos, keine Icon-Bibliothek. Netzsymbole in der Paketreise als einfache Strichzeichnungen in `--ink`.
