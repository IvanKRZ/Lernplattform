// Läuft vor dem ersten Zeichnen, damit die Seite nicht kurz hell aufblitzt.
(function () {
  var saved = null;
  try { saved = localStorage.getItem('lernstack.theme'); } catch (e) { /* kein Speicher */ }
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
})();
