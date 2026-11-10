// Fächer-Registry. Neues Fach: Ordner unter content/ anlegen, hier eintragen, status auf 'aktiv'.
import netzwerktechnik from './netzwerktechnik/index.js';

export const subjects = [
  netzwerktechnik,
  { id: 'java', title: 'Java', short: 'JAV', color: '#ffb35a', status: 'bald', desc: 'Programmieren lernen: Grundlagen, Kontrollstrukturen und objektorientiertes Arbeiten.' },
  { id: 'csharp', title: 'C#', short: 'C#', color: '#b48cff', status: 'bald', desc: 'Die zweite Programmiersprache der Umschulung, mit Klassen und .NET.' },
  { id: 'sql', title: 'SQL & Datenbanken', short: 'SQL', color: '#7aa2ff', status: 'bald', desc: 'Daten abfragen und Datenbanken sauber planen.' },
  { id: 'linux', title: 'Linux & Shell', short: 'SH', color: '#9be564', status: 'bald', desc: 'Die wichtigsten Befehle, Dateirechte und die Arbeit in der Shell.' },
  { id: 'powershell', title: 'CMD & PowerShell', short: 'PS', color: '#5ac8ff', status: 'bald', desc: 'Windows über die Kommandozeile verwalten und kleine Skripte schreiben.' },
  { id: 'web', title: 'HTML', short: 'WEB', color: '#ff6b8b', status: 'bald', desc: 'Webseiten richtig aufbauen, mit Formularen und sinnvoller Struktur.' },
];
subjects[0].status = 'aktiv';

export const byId = Object.fromEntries(subjects.map(s => [s.id, s]));
