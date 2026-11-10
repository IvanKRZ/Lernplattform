// Anfragen an die Lernstack-API. Fehler kommen als Error mit .status und .body zurück.
export async function api(method, path, body, { keepalive = false } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      keepalive,
      headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-Requested-With': 'lernstack' },
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    });
  } catch {
    throw Object.assign(new Error('Der Server ist nicht erreichbar. Prüf deine Verbindung und probier es noch einmal.'), { status: 0 });
  }
  let data = null;
  try { data = await res.json(); } catch { /* keine JSON-Antwort */ }
  if (!res.ok || !data) throw Object.assign(new Error(data?.error || 'Der Server hat nicht wie erwartet geantwortet.'), { status: res.status, body: data });
  return data;
}
