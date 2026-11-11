// Fächer-Registry. Neues Fach: Ordner unter content/ anlegen, hier importieren und in die Liste eintragen.
// Zurzeit gibt es bewusst nur Netzwerktechnik.
import netzwerktechnik from './netzwerktechnik/index.js';

export const subjects = [
  { ...netzwerktechnik, status: 'aktiv' },
];

export const byId = Object.fromEntries(subjects.map(s => [s.id, s]));
