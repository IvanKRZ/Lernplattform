// Aufgaben-Generatoren für Netzwerktechnik.
// Jeder Generator liefert: { q, answer, check(input), explain, hint }
// q/explain sind HTML-Strings. Keine DOM-Abhängigkeit, damit sie in Node testbar sind.

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];

// ---------- IP-Helfer ----------
export const ip2int = s => s.split('.').reduce((a, o) => (a * 256) + Number(o), 0);
export const int2ip = n => [24, 16, 8, 0].map(s => Math.floor(n / 2 ** s) % 256).join('.');
export const maskInt = p => p === 0 ? 0 : (2 ** 32 - 2 ** (32 - p));
export const mask = p => int2ip(maskInt(p));
const netOf = (ipI, p) => Math.floor(ipI / 2 ** (32 - p)) * 2 ** (32 - p);
const bcOf = (ipI, p) => netOf(ipI, p) + 2 ** (32 - p) - 1;
const bin8 = n => n.toString(2).padStart(8, '0');
const fmt = n => n.toLocaleString('de-DE');

// ---------- Eingabe-Normalisierung ----------
const clean = s => String(s ?? '').trim().toLowerCase().replace(/\s+/g, '');
const numIn = s => {
  // akzeptiert 1022, 1.022, 1 022
  const c = clean(s).replace(/\./g, '');
  return /^-?\d+$/.test(c) ? Number(c) : NaN;
};
const decIn = s => {
  // Kommazahl: 1,77 oder 1.77, optional "db"
  const c = clean(s).replace(/db$/, '').replace(',', '.');
  return /^-?\d+(\.\d+)?$/.test(c) ? Number(c) : NaN;
};
const binIn = s => { const c = clean(s).replace(/^0b/, '').replace(/b$/, ''); return /^[01]+$/.test(c) ? parseInt(c, 2) : NaN; };
const hexIn = s => { const c = clean(s).replace(/^0x/, '').replace(/h$/, ''); return /^[0-9a-f]+$/.test(c) ? parseInt(c, 16) : NaN; };
const ipIn = s => {
  const c = clean(s);
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(c)) return NaN;
  const o = c.split('.').map(Number);
  return o.every(x => x <= 255) ? ip2int(c) : NaN;
};
const prefixIn = s => {
  const c = clean(s);
  if (/^\/?\d{1,2}$/.test(c)) return Number(c.replace('/', ''));
  const m = ipIn(c);
  if (isNaN(m)) return NaN;
  for (let p = 0; p <= 32; p++) if (maskInt(p) === m) return p;
  return NaN;
};
const yesNo = s => { const c = clean(s); return ['ja', 'j', 'yes', 'y'].includes(c) ? true : ['nein', 'n', 'no'].includes(c) ? false : null; };

// ---------- Visualisierung: 32-Bit-Balken ----------
export function bitsHTML(ipI, p, label = '') {
  let cells = '';
  for (let i = 0; i < 32; i++) {
    const bit = Math.floor(ipI / 2 ** (31 - i)) % 2;
    cells += `<span class="b ${i < p ? 'net' : 'host'}">${bit}</span>`;
    if (i % 8 === 7 && i < 31) cells += '<span class="dot">.</span>';
  }
  return `<div class="bits">${label ? `<span class="bits-label">${label}</span>` : ''}<span class="bits-row">${cells}</span></div>`;
}
const bitLegend = p => `<div class="bits-legend"><span class="b net">n</span> Netzanteil (${p} Bit) <span class="b host">h</span> Hostanteil (${32 - p} Bit)</div>`;

function placeTable(n, bits = 8) {
  const vals = Array.from({ length: bits }, (_, i) => 2 ** (bits - 1 - i));
  const b = n.toString(2).padStart(bits, '0');
  return `<table class="place"><tr>${vals.map(v => `<th>${v}</th>`).join('')}</tr>` +
    `<tr>${[...b].map(x => `<td class="${x === '1' ? 'on' : ''}">${x}</td>`).join('')}</tr></table>`;
}

// ---------- Generatoren ----------
export const generators = [
  // ===== Zahlensysteme =====
  {
    id: 'dec2bin', group: 'zahlen', topic: 'zahlensysteme', title: 'Dezimal in Binär',
    make(level = 1) {
      const n = level === 1 ? R(1, 255) : level === 2 ? R(16, 255) : R(256, 1023);
      const bits = n > 255 ? 10 : 8;
      return {
        q: `Wandle <b>${n}</b> (dezimal) in eine Binärzahl um.`,
        answer: n.toString(2).padStart(bits, '0'),
        check: s => binIn(s) === n,
        hint: 'Stellenwerte 128, 64, 32 … von links: passt der Wert rein? Dann 1 und abziehen.',
        explain: `Von links jeden Stellenwert prüfen: passt er in den Rest, schreib 1 und zieh ihn ab.${placeTable(n, bits)}` +
          `<p>${n} = ${[...n.toString(2).padStart(bits, '0')].map((x, i) => x === '1' ? 2 ** (bits - 1 - i) : null).filter(Boolean).join(' + ')}</p>`,
      };
    },
  },
  {
    id: 'bin2dec', group: 'zahlen', topic: 'zahlensysteme', title: 'Binär in Dezimal',
    make(level = 1) {
      const bits = level === 3 ? 12 : 8;
      const n = level === 1 ? R(1, 127) : R(2 ** (bits - 1), 2 ** bits - 1);
      const b = n.toString(2).padStart(bits, '0');
      return {
        q: `Wandle <b class="mono">${b.replace(/(.{4})(?=.)/g, '$1 ')}</b> (binär) in eine Dezimalzahl um.`,
        answer: String(n),
        check: s => numIn(s) === n,
        hint: 'Nur die Stellenwerte addieren, an denen eine 1 steht.',
        explain: `Nur die Stellen mit 1 addieren:${placeTable(n, bits)}<p>${[...b].map((x, i) => x === '1' ? 2 ** (bits - 1 - i) : null).filter(Boolean).join(' + ')} = <b>${n}</b></p>`,
      };
    },
  },
  {
    id: 'hex2dec', group: 'zahlen', topic: 'zahlensysteme', title: 'Hex in Dezimal',
    make(level = 1) {
      const n = level === 1 ? R(16, 255) : level === 2 ? R(256, 4095) : R(4096, 65535);
      const hx = n.toString(16).toUpperCase();
      const digits = [...hx];
      const terms = digits.map((d, i) => `${d}·16<sup>${digits.length - 1 - i}</sup> = ${parseInt(d, 16)}·${16 ** (digits.length - 1 - i)} = ${parseInt(d, 16) * 16 ** (digits.length - 1 - i)}`);
      return {
        q: `Wandle <b class="mono">${hx}</b> (hexadezimal) in eine Dezimalzahl um.`,
        answer: String(n),
        check: s => numIn(s) === n,
        hint: 'A=10 … F=15. Jede Stelle mit 16<sup>Position</sup> multiplizieren.',
        explain: `<p>Jede Stelle mal ihren Stellenwert (A=10, B=11, C=12, D=13, E=14, F=15):</p><ul>${terms.map(t => `<li>${t}</li>`).join('')}</ul><p>Summe = <b>${fmt(n)}</b></p>` +
          `<p class="muted">Alternativ über Binär: ${digits.map(d => parseInt(d, 16).toString(2).padStart(4, '0')).join(' ')}</p>`,
      };
    },
  },
  {
    id: 'dec2hex', group: 'zahlen', topic: 'zahlensysteme', title: 'Dezimal in Hex',
    make(level = 1) {
      const n = level === 1 ? R(16, 255) : level === 2 ? R(256, 4095) : R(4096, 65535);
      const steps = []; let x = n;
      while (x > 0) { const q = Math.floor(x / 16), r = x % 16; steps.push(`${x} : 16 = ${q} Rest ${r}${r > 9 ? ` (= ${r.toString(16).toUpperCase()})` : ''}`); x = q; }
      return {
        q: `Wandle <b>${n}</b> (dezimal) in eine Hexadezimalzahl um.`,
        answer: n.toString(16).toUpperCase(),
        check: s => hexIn(s) === n,
        hint: 'Restwertverfahren: immer durch 16 teilen, Reste von unten nach oben lesen.',
        explain: `<p>Restwertverfahren:</p><ul>${steps.map(s => `<li>${s}</li>`).join('')}</ul><p>Reste von unten nach oben gelesen: <b class="mono">${n.toString(16).toUpperCase()}</b></p>`,
      };
    },
  },
  {
    id: 'bin2hex', group: 'zahlen', topic: 'zahlensysteme', title: 'Binär in Hex',
    make(level = 1) {
      const bits = level === 1 ? 8 : 16;
      const n = R(2 ** (bits - 4), 2 ** bits - 1);
      const b = n.toString(2).padStart(bits, '0');
      const nibbles = b.match(/.{4}/g);
      return {
        q: `Wandle <b class="mono">${nibbles.join(' ')}</b> (binär) in Hexadezimal um.`,
        answer: n.toString(16).toUpperCase().padStart(bits / 4, '0'),
        check: s => hexIn(s) === n,
        hint: 'Je 4 Bit (Nibble) ergeben genau eine Hex-Ziffer. Stellenwerte 8-4-2-1.',
        explain: `<p>In 4er-Gruppen teilen, jede Gruppe einzeln umrechnen (8-4-2-1):</p><table class="place"><tr>${nibbles.map(x => `<td class="mono">${x}</td>`).join('')}</tr><tr>${nibbles.map(x => `<th>${parseInt(x, 2)} = ${parseInt(x, 2).toString(16).toUpperCase()}</th>`).join('')}</tr></table><p>Ergebnis: <b class="mono">${n.toString(16).toUpperCase().padStart(bits / 4, '0')}</b></p>`,
      };
    },
  },
  {
    id: 'hex2bin', group: 'zahlen', topic: 'zahlensysteme', title: 'Hex in Binär',
    make(level = 1) {
      const digits = level === 1 ? 2 : 4;
      const n = R(16 ** (digits - 1), 16 ** digits - 1);
      const hx = n.toString(16).toUpperCase();
      return {
        q: `Wandle <b class="mono">${hx}</b> (hexadezimal) in Binär um.`,
        answer: n.toString(2).padStart(digits * 4, '0').match(/.{4}/g).join(' '),
        check: s => binIn(s) === n,
        hint: 'Jede Hex-Ziffer wird zu genau 4 Bit.',
        explain: `<table class="place"><tr>${[...hx].map(d => `<th>${d} = ${parseInt(d, 16)}</th>`).join('')}</tr><tr>${[...hx].map(d => `<td class="mono">${parseInt(d, 16).toString(2).padStart(4, '0')}</td>`).join('')}</tr></table>`,
      };
    },
  },
  {
    id: 'praefix', group: 'zahlen', topic: 'zahlensysteme', title: 'kB oder KiB',
    make() {
      const tasks = [
        () => { const k = R(2, 16); return { q: `Wie viele <b>Byte</b> sind <b>${k} KiB</b>?`, n: k * 1024, ex: `KiB ist binär (IEC): 1 KiB sind 1.024 Byte. Also: ${k} · 1.024 = <b>${fmt(k * 1024)}</b> Byte` }; },
        () => { const k = R(2, 16); return { q: `Wie viele <b>Byte</b> sind <b>${k} kB</b>?`, n: k * 1000, ex: `kB ist dezimal (SI): 1 kB sind 1.000 Byte. Also: ${k} · 1.000 = <b>${fmt(k * 1000)}</b> Byte` }; },
        () => { const k = R(2, 8); return { q: `Wie viele <b>KiB</b> sind <b>${k} MiB</b>?`, n: k * 1024, ex: `1 MiB sind 1.024 KiB. Also: ${k} · 1.024 = <b>${fmt(k * 1024)}</b> KiB` }; },
        () => { const k = R(2, 8); return { q: `Wie viele <b>MB</b> sind <b>${k} GB</b>?`, n: k * 1000, ex: `Nach SI sind 1 GB genau 1.000 MB. Also: <b>${fmt(k * 1000)}</b> MB` }; },
        () => { const k = pick([1, 2, 4]); return { q: `Wie viele <b>Bit</b> sind <b>${k} KiB</b>?`, n: k * 1024 * 8, ex: `${k} KiB = ${fmt(k * 1024)} Byte, und jedes Byte hat 8 Bit. Ergebnis: <b>${fmt(k * 8192)}</b> Bit` }; },
        () => { const e = pick([10, 16, 20]); return { q: `Wie viel ist <b>2<sup>${e}</sup></b>?`, n: 2 ** e, ex: `2<sup>${e}</sup> = <b>${fmt(2 ** e)}</b>${e === 10 ? ' (= 1 Ki)' : e === 20 ? ' (= 1 Mi)' : ''}` }; },
      ];
      const t = pick(tasks)();
      return { q: t.q, answer: String(t.n), check: s => numIn(s) === t.n, hint: 'Mit „i“ (KiB, MiB) rechnest du mit 1.024, ohne „i“ (kB, MB) mit 1.000.', explain: `<p>${t.ex}</p>` };
    },
  },

  // ===== Subnetting =====
  {
    id: 'cidr2mask', group: 'subnet', topic: 'subnetting', title: 'Präfix in Subnetzmaske',
    make(level = 1) {
      const p = level === 1 ? pick([8, 16, 24, 25, 26, 27, 28]) : R(level === 2 ? 17 : 9, 30);
      const m = maskInt(p);
      return {
        q: `Welche Subnetzmaske gehört zu <b>/${p}</b>?`,
        answer: mask(p),
        check: s => ipIn(s) === m,
        hint: `/${p} = ${p} Einsen von links. Volle Oktette sind 255.`,
        explain: `${bitsHTML(m, p)}${bitLegend(p)}<p>${p} Einsen von links. Ein angefangenes Oktett: 128, 192, 224, 240, 248, 252, 254, 255.</p><p>Ergebnis: <b class="mono">${mask(p)}</b></p>`,
      };
    },
  },
  {
    id: 'mask2cidr', group: 'subnet', topic: 'subnetting', title: 'Subnetzmaske in Präfix',
    make(level = 1) {
      const p = level === 1 ? pick([8, 16, 24, 25, 26, 27, 28]) : R(level === 2 ? 17 : 9, 30);
      return {
        q: `Welches Präfix (CIDR) hat die Maske <b class="mono">${mask(p)}</b>?`,
        answer: '/' + p,
        check: s => { const c = clean(s); return /^\/?\d{1,2}$/.test(c) && Number(c.replace('/', '')) === p; },
        hint: 'Einsen zählen: 255 = 8, 128 = 1, 192 = 2, 224 = 3, 240 = 4, 248 = 5, 252 = 6, 254 = 7.',
        explain: `${bitsHTML(maskInt(p), p)}<p>Anzahl der Einsen = <b>/${p}</b></p>`,
      };
    },
  },
  {
    id: 'hosts', group: 'subnet', topic: 'subnetting', title: 'Nutzbare Hosts',
    make(level = 1) {
      const p = level === 1 ? R(24, 30) : level === 2 ? R(20, 30) : R(9, 23);
      const n = 2 ** (32 - p) - 2;
      return {
        q: `Wie viele <b>nutzbare Hosts</b> hat ein Netz mit <b>/${p}</b>?`,
        answer: fmt(n),
        check: s => numIn(s) === n,
        hint: 'Hostbits = 32 − Präfix. Hosts = 2<sup>Hostbits</sup> − 2 (Netz- und Broadcastadresse).',
        explain: `<p>Hostbits = 32 − ${p} = ${32 - p}</p><p>2<sup>${32 - p}</sup> − 2 = ${fmt(2 ** (32 - p))} − 2 = <b>${fmt(n)}</b></p><p class="muted">−2, weil Netzadresse (alle Hostbits 0) und Broadcast (alle Hostbits 1) nicht vergeben werden.</p>`,
      };
    },
  },
  ...['netid', 'broadcast', 'firsthost', 'lasthost'].map(kind => ({
    id: kind, group: 'subnet', topic: 'subnetting',
    title: { netid: 'Netzadresse bestimmen', broadcast: 'Broadcastadresse bestimmen', firsthost: 'Erster nutzbarer Host', lasthost: 'Letzter nutzbarer Host' }[kind],
    make(level = 1) {
      const p = level === 1 ? R(25, 29) : level === 2 ? R(20, 29) : R(12, 29);
      const base = pick(['192.168', '10.', '172.16']);
      let ipI;
      if (base === '192.168') ipI = ip2int(`192.168.${R(0, 255)}.${R(1, 254)}`);
      else if (base === '10.') ipI = ip2int(`10.${R(0, 255)}.${R(0, 255)}.${R(1, 254)}`);
      else ipI = ip2int(`172.${R(16, 31)}.${R(0, 255)}.${R(1, 254)}`);
      const net = netOf(ipI, p), bc = bcOf(ipI, p);
      const target = { netid: net, broadcast: bc, firsthost: net + 1, lasthost: bc - 1 }[kind];
      // Oktett, in dem die Grenze liegt
      const oct = Math.floor((p - 1) / 8); // 0..3
      const block = 2 ** (8 - (p - oct * 8));
      const ipO = int2ip(ipI).split('.').map(Number);
      const val = ipO[oct];
      const lo = Math.floor(val / block) * block;
      const label = { netid: 'Netzadresse', broadcast: 'Broadcastadresse', firsthost: 'erste nutzbare Hostadresse', lasthost: 'letzte nutzbare Hostadresse' }[kind];
      return {
        q: `Host <b class="mono">${int2ip(ipI)}/${p}</b> – wie lautet die <b>${label}</b>?`,
        answer: int2ip(target),
        check: s => ipIn(s) === target,
        hint: `Blockgröße im ${oct + 1}. Oktett = 256 − ${mask(p).split('.')[oct]} = ${block}. In welchem Block liegt ${val}?`,
        explain:
          `<p>Maske /${p} = <span class="mono">${mask(p)}</span>. Die Grenze liegt im <b>${oct + 1}. Oktett</b>.</p>` +
          `<p>Blockgröße (magische Zahl) = 256 − ${mask(p).split('.')[oct]} = <b>${block}</b>. Blöcke: 0, ${block}, ${2 * block}, ${3 * block} …</p>` +
          `<p>${val} liegt im Block <b>${lo} – ${lo + block - 1}</b>.</p>` +
          bitsHTML(ipI, p, 'Host') + bitsHTML(net, p, 'Netz') + bitsHTML(bc, p, 'Broadcast') + bitLegend(p) +
          `<table><tr><th>Netzadresse</th><td class="mono">${int2ip(net)}</td></tr><tr><th>Erster Host</th><td class="mono">${int2ip(net + 1)}</td></tr><tr><th>Letzter Host</th><td class="mono">${int2ip(bc - 1)}</td></tr><tr><th>Broadcast</th><td class="mono">${int2ip(bc)}</td></tr></table>`,
      };
    },
  })),
  {
    id: 'split', group: 'subnet', topic: 'subnetting', title: 'Netz in Subnetze teilen',
    make(level = 1) {
      const baseP = level === 3 ? pick([16, 20, 22]) : 24;
      const k = level === 1 ? pick([2, 4, 8, 16]) : pick([3, 5, 6, 7, 10, 12, 20, 30, 50, 100].filter(x => Math.ceil(Math.log2(x)) + baseP <= 30));
      const borrow = Math.ceil(Math.log2(k));
      const np = baseP + borrow;
      const net = baseP === 24 ? `192.168.${R(0, 255)}.0` : baseP === 16 ? `172.${R(16, 31)}.0.0` : int2ip(netOf(ip2int(`10.${R(0, 255)}.${R(0, 255)}.0`), baseP));
      return {
        q: `Das Netz <b class="mono">${net}/${baseP}</b> soll in <b>${k} gleich große Subnetze</b> aufgeteilt werden. Welches <b>Präfix</b> haben die Subnetze?`,
        answer: `/${np} (${mask(np)})`,
        check: s => prefixIn(s) === np,
        hint: 'Wie viele Bits musst du ausleihen, damit 2<sup>n</sup> ≥ Anzahl Subnetze?',
        explain: `<p>Gesucht ist die kleinste Zahl n, für die 2<sup>n</sup> mindestens ${k} ergibt. Das ist n = <b>${borrow}</b> (2<sup>${borrow}</sup> = ${2 ** borrow}${2 ** borrow > k ? `, ${2 ** borrow - k} Subnetz(e) Reserve` : ''})</p><p>Neues Präfix = /${baseP} + ${borrow} = <b>/${np}</b> = <span class="mono">${mask(np)}</span></p><p>Hosts je Subnetz: 2<sup>${32 - np}</sup> − 2 = ${fmt(2 ** (32 - np) - 2)}</p>${bitsHTML(maskInt(np), np)}`,
      };
    },
  },
  {
    id: 'needhosts', group: 'subnet', topic: 'subnetting', title: 'Präfix für Hostanzahl',
    make(level = 1) {
      const h = level === 1 ? pick([10, 20, 25, 50, 60, 100, 120]) : pick([5, 13, 30, 31, 62, 63, 126, 200, 500, 1000, 2000]);
      let hb = 1; while (2 ** hb - 2 < h) hb++;
      const p = 32 - hb;
      return {
        q: `Ein Subnetz braucht mindestens <b>${h} Hosts</b>. Welches ist das <b>größte Präfix</b> (kleinstes Netz), das reicht?`,
        answer: `/${p} (${mask(p)})`,
        check: s => prefixIn(s) === p,
        hint: 'Kleinstes n mit 2<sup>n</sup> − 2 ≥ Hosts. Präfix = 32 − n.',
        explain: `<p>Probiere die Hostbits durch: 2<sup>${hb - 1}</sup> − 2 = ${2 ** (hb - 1) - 2} ${2 ** (hb - 1) - 2 < h ? '&lt;' : '≥'} ${h}, aber 2<sup>${hb}</sup> − 2 = ${2 ** hb - 2} ≥ ${h}. Du brauchst also ${hb} Hostbits.</p><p>Präfix = 32 − ${hb} = <b>/${p}</b> (<span class="mono">${mask(p)}</span>)</p>`,
      };
    },
  },
  {
    id: 'whichsubnet', group: 'subnet', topic: 'subnetting', title: 'In welchem Subnetz liegt der Host?',
    make() {
      const k = pick([4, 8, 16]);
      const np = 24 + Math.log2(k);
      const block = 256 / k;
      const third = R(0, 255);
      const last = R(1, 254);
      const hostI = ip2int(`192.168.${third}.${last}`);
      const net = netOf(hostI, np);
      const idx = Math.floor(last / block) + 1;
      return {
        q: `<b class="mono">192.168.${third}.0/24</b> wird in <b>${k}</b> gleich große Subnetze geteilt. In welchem Subnetz liegt <b class="mono">192.168.${third}.${last}</b>? (Netzadresse angeben)`,
        answer: int2ip(net),
        check: s => ipIn(s) === net,
        hint: `Blockgröße = 256 : ${k} = ${block}.`,
        explain: `<p>Für ${k} Subnetze leihst du ${Math.log2(k)} Bit, das ergibt /${np} mit der Blockgröße ${block}. Die Subnetze beginnen bei ${Array.from({ length: Math.min(k, 8) }, (_, i) => i * block).join(', ')}${k > 8 ? ' …' : ''}.</p><p>${last} liegt im Block ${Math.floor(last / block) * block} – ${Math.floor(last / block) * block + block - 1}. Das ist das <b>${idx}. Subnetz</b>: <span class="mono">${int2ip(net)}/${np}</span></p>`,
      };
    },
  },
  {
    id: 'nthsubnet', group: 'subnet', topic: 'subnetting', title: 'Das n-te Subnetz',
    make() {
      const np = pick([26, 27, 28, 29]);
      const block = 2 ** (32 - np);
      const k = 256 / block;
      const n = R(2, Math.min(k, 8));
      const third = R(0, 255);
      const netI = ip2int(`192.168.${third}.0`) + (n - 1) * block;
      const kind = pick(['netz', 'bc']);
      const target = kind === 'netz' ? netI : netI + block - 1;
      return {
        q: `<b class="mono">192.168.${third}.0/24</b> wird in /${np}-Subnetze geteilt. Wie lautet die <b>${kind === 'netz' ? 'Netzadresse' : 'Broadcastadresse'}</b> des <b>${n}. Subnetzes</b>?`,
        answer: int2ip(target),
        check: s => ipIn(s) === target,
        hint: `Blockgröße bei /${np} = 2<sup>${32 - np}</sup> = ${block}. Das 1. Subnetz beginnt bei 0.`,
        explain: `<p>Blockgröße = ${block}. Das ${n}. Subnetz beginnt bei (${n} − 1) · ${block} = ${(n - 1) * block}.</p><p>${n}. Subnetz: <span class="mono">${int2ip(netI)}</span> bis <span class="mono">${int2ip(netI + block - 1)}</span></p><p>Gesucht: <b class="mono">${int2ip(target)}</b></p>`,
      };
    },
  },
  {
    id: 'supernet', group: 'subnet', topic: 'subnetting', title: 'Supernetting',
    make(level = 1) {
      const cnt = level === 1 ? pick([2, 4]) : pick([2, 4, 8]);
      const bits = Math.log2(cnt);
      const sp = 24 - bits;
      const startThird = R(0, 255 / cnt | 0) * cnt;
      const first = pick(['192.168', `172.${R(16, 31)}`, `10.${R(0, 255)}`]);
      const nets = Array.from({ length: cnt }, (_, i) => `${first}.${startThird + i}.0/24`);
      const sumI = ip2int(`${first}.${startThird}.0`);
      const ask = pick(['cidr', 'cidr', 'mask', 'hosts']);
      const ex = `<p>Drittes Oktett binär:</p><table class="place">${nets.map((n, i) => `<tr><td class="mono">${first}.<b>${bin8(startThird + i).slice(0, 8 - bits)}</b><span class="muted">${bin8(startThird + i).slice(8 - bits)}</span>.0</td></tr>`).join('')}</table>` +
        `<p>Gleich sind die ersten 16 + ${8 - bits} = <b>${sp} Bit</b>. Das Supernetz ist <b class="mono">${first}.${startThird}.0/${sp}</b> (<span class="mono">${mask(sp)}</span>), Bereich ${first}.${startThird}.0 – ${first}.${startThird + cnt - 1}.255, ${fmt(2 ** (32 - sp) - 2)} nutzbare Hosts.</p>`;
      if (ask === 'hosts') {
        const n = 2 ** (32 - sp) - 2;
        return { q: `Die Netze ${nets.map(n => `<span class="mono">${n}</span>`).join(', ')} werden zu einem Supernetz zusammengefasst. Wie viele <b>nutzbare Hosts</b> hat das Supernetz?`, answer: fmt(n), check: s => numIn(s) === n, hint: 'Erst das Präfix des Supernetzes bestimmen.', explain: ex };
      }
      return {
        q: `Fasse ${nets.map(n => `<span class="mono">${n}</span>`).join(', ')} zu einem Supernetz zusammen. Gib ${ask === 'mask' ? 'die <b>Netzadresse und Subnetzmaske</b>' : 'die <b>Netzadresse mit CIDR</b>'} an.`,
        answer: ask === 'mask' ? `${first}.${startThird}.0 ${mask(sp)}` : `${first}.${startThird}.0/${sp}`,
        check: s => {
          const c = clean(s.replace(/,/g, ' ')).replace(/\s/g, '');
          const m = String(s).trim().split(/[\s/,]+/).filter(Boolean);
          if (m.length < 2) return false;
          return ipIn(m[0]) === sumI && prefixIn(m[1]) === sp && c.length > 0;
        },
        hint: `${cnt} Netze sind 2<sup>${bits}</sup>. Das Präfix ist also ${bits} Bit kürzer als /24.`,
        explain: ex,
      };
    },
  },
  {
    id: 'samenet', group: 'subnet', topic: 'routing', title: 'Gleiches Netz? (Routing-Entscheidung)',
    make() {
      const p = pick([24, 25, 26, 27, 28, 29]);
      const third = R(0, 255);
      const a = R(1, 254);
      const block = 2 ** (32 - p);
      const same = Math.random() < 0.5;
      let b;
      const lo = Math.floor(a / block) * block;
      if (same) { do { b = R(lo + 1, lo + block - 2); } while (b === a && block > 4); }
      else if (p === 24) { b = R(1, 254); }
      else { do { b = R(1, 254); } while (Math.floor(b / block) * block === lo); }
      const thirdB = (!same && p === 24) ? (third + R(1, 9)) % 256 : third;
      const A = `192.168.${third}.${a}`, B = `192.168.${thirdB}.${b}`;
      const isSame = netOf(ip2int(A), p) === netOf(ip2int(B), p);
      return {
        q: `PC1 <b class="mono">${A}/${p}</b> sendet an <b class="mono">${B}</b>. Liegt das Ziel im <b>eigenen Netz</b>? (ja/nein)`,
        answer: isSame ? 'ja – direkt zustellen' : 'nein – an das Default-Gateway',
        check: s => yesNo(s) === isSame,
        hint: 'Beide Adressen mit der Maske verUNDen und Netzadressen vergleichen.',
        explain: `<p>Netzadresse PC1: <span class="mono">${int2ip(netOf(ip2int(A), p))}</span>, Netzadresse Ziel: <span class="mono">${int2ip(netOf(ip2int(B), p))}</span></p>${bitsHTML(ip2int(A), p, 'PC1')}${bitsHTML(ip2int(B), p, 'Ziel')}<p>${isSame ? 'Der Netzanteil ist gleich, also liegt das Ziel im <b>selben Netz</b>. PC1 schickt den Frame direkt an die MAC-Adresse des Ziels, die es per ARP herausfindet.' : 'Der Netzanteil ist verschieden, also liegt das Ziel in einem <b>anderen Netz</b>. PC1 schickt den Frame an die MAC-Adresse seines Default-Gateways.'}</p>`,
      };
    },
  },
  {
    id: 'private', group: 'subnet', topic: 'natpat', title: 'Private Adresse? (RFC 1918)',
    make() {
      const cands = [
        () => `10.${R(0, 255)}.${R(0, 255)}.${R(1, 254)}`,
        () => `172.${R(16, 31)}.${R(0, 255)}.${R(1, 254)}`,
        () => `192.168.${R(0, 255)}.${R(1, 254)}`,
        () => `172.${pick([R(1, 15), R(32, 99)])}.${R(0, 255)}.${R(1, 254)}`,
        () => `192.${pick([167, 169, 0, 88])}.${R(0, 255)}.${R(1, 254)}`,
        () => `${pick([11, 89, 100, 209, 215])}.${R(0, 255)}.${R(0, 255)}.${R(1, 254)}`,
      ];
      const ip = pick(cands)();
      const o = ip.split('.').map(Number);
      const priv = o[0] === 10 || (o[0] === 172 && o[1] >= 16 && o[1] <= 31) || (o[0] === 192 && o[1] === 168);
      return {
        q: `Ist <b class="mono">${ip}</b> eine <b>private</b> IPv4-Adresse? (ja/nein)`,
        answer: priv ? 'ja' : 'nein',
        check: s => yesNo(s) === priv,
        hint: 'RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
        explain: `<p>Private Bereiche (RFC 1918):</p><ul><li>10.0.0.0 – 10.255.255.255 (/8)</li><li>172.16.0.0 – 172.31.255.255 (/12)</li><li>192.168.0.0 – 192.168.255.255 (/16)</li></ul><p><span class="mono">${ip}</span> ist <b>${priv ? 'privat' : 'öffentlich'}</b>.</p>`,
      };
    },
  },

  // ===== Sonstige Rechnungen =====
  {
    id: 'mesh', group: 'sonst', topic: 'topologien', title: 'Vollvermaschung: Verbindungen',
    make() {
      const n = R(3, 12);
      const l = n * (n - 1) / 2;
      return {
        q: `Wie viele <b>Punkt-zu-Punkt-Verbindungen</b> braucht eine <b>vollvermaschte</b> Topologie mit <b>${n}</b> Standorten?`,
        answer: String(l),
        check: s => numIn(s) === l,
        hint: 'Jeder ist mit jedem verbunden. Formel: n · (n − 1) : 2',
        explain: `<p>Jeder Knoten hat ${n - 1} Verbindungen, jede Verbindung wird aber doppelt gezählt:</p><p>${n} · (${n} − 1) : 2 = ${n * (n - 1)} : 2 = <b>${l}</b></p>`,
      };
    },
  },
  {
    id: 'lwl', group: 'sonst', topic: 'kabel', title: 'LWL-Dämpfungsbudget',
    make() {
      const m = pick([60, 90, 120, 150, 200, 250, 300, 400]);
      const att = pick([3.0, 3.5]);
      const con = 0.75;
      const nCon = pick([2, 2, 4]);
      const cable = (m / 1000) * att;
      const total = Math.round((cable + nCon * con) * 1000) / 1000;
      const de = x => x.toLocaleString('de-DE', { maximumFractionDigits: 3 });
      return {
        q: `Multimode-LWL, <b>${m} m</b>, Dämpfung <b>${de(att)} dB/km</b> bei 850 nm. <b>${nCon} Steckverbindungen</b> mit je <b>0,75 dB</b>. Wie groß ist das <b>Dämpfungsbudget</b> in dB?`,
        answer: `${de(total)} dB`,
        check: s => Math.abs(decIn(s) - total) < 0.006,
        hint: 'Länge in km mal dB/km, dazu die Anzahl der Stecker mal 0,75 dB.',
        explain: `<p>Kabel: ${de(m / 1000)} km · ${de(att)} dB/km = ${de(cable)} dB</p><p>Stecker: ${nCon} · 0,75 dB = ${de(nCon * con)} dB</p><p>Budget = ${de(cable)} + ${de(nCon * con)} = <b>${de(total)} dB</b></p>`,
      };
    },
  },
  {
    id: 'pat', group: 'sonst', topic: 'natpat', title: 'PAT: welcher Port wird vergeben?',
    make(level = 1) {
      const groups = [[0, 511], [512, 1023], [1024, 65535]];
      const p = pick([pick([80, 123, 443]), pick([600, 700, 1000]), pick([5000, 49152, 50000, 3333])]);
      const g = groups.find(([a, b]) => p >= a && p <= b);
      const taken = new Set();
      const free = level === 1 && Math.random() < 0.4;
      if (!free) {
        taken.add(p);
        const k = R(0, 4);
        for (let i = 0; i < k; i++) taken.add(g[0] + i);
      }
      // ein paar Ablenker in anderen Gruppen
      taken.add(pick([1024, 1025, 512, 513, 0, 1]));
      if (!free) taken.add(p);
      let ans = p;
      if (taken.has(p)) { ans = g[0]; while (taken.has(ans)) ans++; }
      const list = [...taken].sort((a, b) => a - b);
      return {
        q: `Ein PC sendet mit Quellport <b>${p}</b>. Auf der öffentlichen IP des Routers sind bereits die Ports <b class="mono">${list.join(', ')}</b> belegt. Welchen <b>Quellport</b> verwendet der Router nach den PAT-Regeln?`,
        answer: String(ans),
        check: s => numIn(s) === ans,
        hint: 'Portgruppen: 0–511, 512–1023, 1024–65535. Erst Originalport, sonst erster freier Port derselben Gruppe von unten.',
        explain: `<ol><li>Originalport ${p} frei? ${taken.has(p) ? '<b>Nein</b>, belegt.' : '<b>Ja</b>, also bleibt der Port erhalten.'}</li>${taken.has(p) ? `<li>${p} gehört zur Gruppe <b>${g[0]}–${g[1]}</b>.</li><li>Erster freier Port dieser Gruppe von unten: <b>${ans}</b></li>` : ''}</ol><p class="muted">Gäbe es in der Gruppe keinen freien Port mehr, würde die nächste IP aus dem NAT-Pool verwendet.</p>`,
      };
    },
  },
];

export const byId = Object.fromEntries(generators.map(g => [g.id, g]));
export const groups = {
  zahlen: { title: 'Zahlensysteme', desc: 'Umrechnen zwischen binär, dezimal und hexadezimal, dazu kB und KiB.' },
  subnet: { title: 'Subnetting', desc: 'Masken, Netzadressen, Hosts zählen, Netze teilen und zusammenfassen.' },
  sonst: { title: 'Weitere Rechnungen', desc: 'PAT-Ports, Dämpfungsbudget und Verbindungen bei Vollvermaschung.' },
};
