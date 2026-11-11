// Netzwerktechnik – Teil 1: Zahlensysteme, Subnetting, Protokollmodelle
// Fragetypen: mc (eine richtige), multi (mehrere richtige), tf (wahr/falsch), input (freie Eingabe)
// learn: Abschnitte der Lernseite { h: Überschrift, html: Inhalt }

export const zahlensysteme = {
  id: 'zahlensysteme', title: 'Zahlensysteme', color: '#E07020',
  blurb: 'Wie Computer zählen: binär, dezimal und hexadezimal, dazu der Unterschied zwischen kB und KiB.',
  pruefung: 'Umrechnungen zwischen Binär, Dezimal und Hexadezimal sowie Speichergrößen (kB und KiB) gehören zum Grundstoff für Teil 1 der Abschlussprüfung. In Teil 2 brauchst du sie als Werkzeug, etwa beim Subnetting und bei MAC- und IPv6-Adressen.',
  gens: ['dec2bin', 'bin2dec', 'hex2dec', 'dec2hex', 'bin2hex', 'hex2bin', 'praefix'],
  learn: [
    {
      h: 'Worum es geht',
      html: `<p>Ein Zahlensystem legt fest, mit wie vielen verschiedenen Ziffern man zählt. Diese Anzahl heißt <b>Basis</b>. Im Alltag nutzen wir das Dezimalsystem mit zehn Ziffern (0 bis 9). Computer arbeiten intern mit nur zwei Zuständen: Strom an oder aus. Deshalb rechnen sie im <b>Binärsystem</b> (auch Dualsystem) mit den Ziffern 0 und 1.</p>
      <p>Lange Binärzahlen sind für Menschen schwer zu lesen. Darum fasst man sie oft im <b>Hexadezimalsystem</b> zusammen. Es hat 16 Ziffern: 0 bis 9 und danach die Buchstaben A bis F. A steht für 10, B für 11 und so weiter bis F für 15. MAC-Adressen und IPv6-Adressen werden zum Beispiel hexadezimal geschrieben.</p>
      <table><tr><th>System</th><th>Basis</th><th>Ziffern</th><th>Kennzeichnung</th></tr>
      <tr><td>Dezimal</td><td>10</td><td>0–9</td><td>56<sub>10</sub> oder 56d</td></tr>
      <tr><td>Binär</td><td>2</td><td>0, 1</td><td>00111000<sub>2</sub> oder 00111000b</td></tr>
      <tr><td>Hexadezimal</td><td>16</td><td>0–9, A–F</td><td>130<sub>16</sub> oder 130h</td></tr></table>`,
    },
    {
      h: 'Stellenwerte verstehen',
      html: `<p>In jedem Zahlensystem hat jede Stelle einen Wert. Im Dezimalsystem sind das von rechts nach links Einer, Zehner, Hunderter. Die Zahl 347 bedeutet also 3 Hunderter, 4 Zehner und 7 Einer.</p>
      <p>Im Binärsystem verdoppelt sich der Stellenwert mit jeder Stelle nach links. Für ein Byte (8 Bit, auch Oktett genannt) sehen die Stellenwerte so aus:</p>
      <div class="rechnung"><table class="place"><tr><th>128</th><th>64</th><th>32</th><th>16</th><th>8</th><th>4</th><th>2</th><th>1</th></tr></table></div>
      <p>Wenn alle acht Bits auf 1 stehen, ergibt das 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255. Mit 8 Bit kann man also 256 verschiedene Werte darstellen, von 0 bis 255.</p>
      <div class="merke"><b>Merke:</b> Mit n Bit lassen sich 2<sup>n</sup> verschiedene Werte darstellen. Der größte Wert ist 2<sup>n</sup> − 1.</div>`,
    },
    {
      h: 'Binär in Dezimal umrechnen',
      html: `<p>Schreibe die Binärzahl unter die Stellenwerte. Dann addierst du nur die Stellenwerte, unter denen eine 1 steht.</p>
      <div class="rechnung"><p>Beispiel: 0011 1000</p><table class="place"><tr><th>128</th><th>64</th><th>32</th><th>16</th><th>8</th><th>4</th><th>2</th><th>1</th></tr><tr><td>0</td><td>0</td><td class="on">1</td><td class="on">1</td><td class="on">1</td><td>0</td><td>0</td><td>0</td></tr></table><p>32 + 16 + 8 = <b>56</b></p></div>`,
    },
    {
      h: 'Dezimal in Binär umrechnen',
      html: `<p>Gehe die Stellenwerte von links nach rechts durch. Passt der Stellenwert noch in die Restzahl, schreibst du eine 1 und ziehst ihn ab. Passt er nicht, schreibst du eine 0.</p>
      <div class="rechnung"><p>Beispiel: 200</p><p>128 passt (Rest 72), 64 passt (Rest 8), 32 passt nicht, 16 passt nicht, 8 passt (Rest 0), der Rest sind Nullen.</p><p>Ergebnis: <b>1100 1000</b></p></div>`,
    },
    {
      h: 'Dezimal in Hexadezimal: das Restwertverfahren',
      html: `<p>Teile die Zahl immer wieder durch 16 und schreibe jeweils den Rest auf. Wenn das Ergebnis 0 ist, liest du die Reste von unten nach oben. Reste über 9 schreibst du als Buchstaben.</p>
      <div class="rechnung"><p>Beispiel: 304</p><p>304 : 16 = 19, Rest 0<br>19 : 16 = 1, Rest 3<br>1 : 16 = 0, Rest 1</p><p>Von unten gelesen: <b>130h</b></p></div>`,
    },
    {
      h: 'Binär und Hexadezimal: der schnelle Weg',
      html: `<p>Eine Hex-Ziffer steht immer für genau 4 Bit. Eine solche Vierergruppe nennt man <b>Nibble</b>. Du teilst die Binärzahl also von rechts in Vierergruppen und rechnest jede Gruppe einzeln mit den Stellenwerten 8, 4, 2, 1 um.</p>
      <div class="rechnung"><p>Beispiel: F08E in Dezimal</p><p>F = 1111, 0 = 0000, 8 = 1000, E = 1110<br>Binär: 1111 0000 1000 1110</p><p>Jetzt die Stellen mit 1 addieren: 32768 + 16384 + 8192 + 4096 + 128 + 8 + 4 + 2 = <b>61.582</b></p></div>
      <p>Alternativ rechnest du direkt mit Potenzen von 16: F · 4096 + 0 · 256 + 8 · 16 + E · 1 = 15 · 4096 + 128 + 14 = 61.582.</p>`,
    },
    {
      h: 'Kilobyte oder Kibibyte?',
      html: `<p>Ein <b>Präfix</b> ist eine Vorsilbe, die vor einer Einheit steht, zum Beispiel „Kilo“ in Kilobyte. Ein <b>Suffix</b> ist eine Nachsilbe oder Endung, zum Beispiel „.docx“ bei einem Dateinamen.</p>
      <p>Bei Speichergrößen gibt es zwei Standards, und genau das sorgt oft für Verwirrung:</p>
      <table><tr><th>Standard</th><th>Basis</th><th>Beispiel</th></tr>
      <tr><td>SI (Système international, Paris), dezimal</td><td>1.000</td><td>1 kB = 1.000 Byte, 1 MB = 1.000.000 Byte</td></tr>
      <tr><td>IEC (International Electrotechnical Commission, Genf), binär</td><td>1.024</td><td>1 KiB = 1.024 Byte, 1 MiB = 1.048.576 Byte</td></tr></table>
      <p>Die binären Einheiten erkennst du am kleinen „i“: Kibibyte (KiB), Mebibyte (MiB), Gibibyte (GiB), Tebibyte (TiB). Gesprochen sagt man auch „Kilobinärbyte“.</p>
      <p>Festplattenhersteller rechnen dezimal. Windows rechnet binär, zeigt aber „GB“ an. Deshalb erscheint eine 1-TB-Festplatte unter Windows nur mit etwa 931 GB.</p>
      <div class="merke"><b>Schreibweise:</b> Vielfache einer Einheit schreibt man groß (MB, GB, TB). Die Ausnahme ist Kilo mit kleinem k: kB. Teile einer Einheit schreibt man klein, zum Beispiel ml für Milliliter.</div>`,
    },
  ],
  questions: [
    { id: 'z1', type: 'mc', q: 'Welche Basis hat das Hexadezimalsystem?', options: ['16', '8', '2', '10'], answer: 0, explain: 'Das Hexadezimalsystem hat 16 Ziffern: 0 bis 9 und A bis F. Deshalb ist seine Basis 16.' },
    { id: 'z2', type: 'mc', q: 'Welchen Dezimalwert hat die Hex-Ziffer <b>C</b>?', options: ['12', '11', '13', '14'], answer: 0, explain: 'Nach der 9 geht es mit Buchstaben weiter: A ist 10, B ist 11, C ist 12.' },
    { id: 'z3', type: 'input', q: 'Was ist der größte Dezimalwert, den man mit <b>8 Bit</b> darstellen kann?', accept: ['255'], explain: 'Wenn alle acht Bits auf 1 stehen, ergibt das 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255. Das entspricht 2<sup>8</sup> − 1.' },
    { id: 'z4', type: 'input', q: 'Wie viele verschiedene Werte lassen sich mit <b>12 Bit</b> darstellen?', accept: ['4096', '4.096'], explain: 'Mit n Bit gibt es 2<sup>n</sup> Möglichkeiten, hier also 2<sup>12</sup> = 4.096. Genau so viele Werte hat übrigens die VLAN-ID.' },
    { id: 'z5', type: 'mc', q: 'Was bedeutet die Angabe <b>MiB</b>?', options: ['Mebibyte, also 1.048.576 Byte', 'Megabyte, also 1.000.000 Byte', 'Megabit', 'Millibyte'], answer: 0, explain: 'Das kleine „i“ zeigt eine binäre Einheit an. 1 MiB sind 2<sup>20</sup> Byte, also 1.048.576 Byte.' },
    { id: 'z6', type: 'mc', q: 'Welche Organisation hat die <b>binären</b> Präfixe KiB, MiB und GiB festgelegt?', options: ['Die IEC in Genf', 'Das SI in Paris', 'Die ISO', 'Die IEEE'], answer: 0, explain: 'Die International Electrotechnical Commission (IEC) in Genf hat die binären Präfixe eingeführt. Das SI aus Paris steht für die dezimalen Präfixe wie kB und MB.' },
    { id: 'z7', type: 'tf', q: 'Eine Festplatte mit „1 TB“ hat laut Hersteller 1.000.000.000.000 Byte. Windows zeigt dafür etwa 931 „GB“ an, weil es binär rechnet.', answer: true, explain: 'Der Hersteller rechnet dezimal mit 10<sup>12</sup> Byte. Windows teilt durch 2<sup>30</sup> und kommt so auf etwa 931. Eigentlich müsste Windows dafür „GiB“ anzeigen.' },
    { id: 'z8', type: 'mc', q: 'Wie schreibt man Kilobyte nach SI richtig ab?', options: ['kB', 'KB', 'Kb', 'KiB'], answer: 0, explain: 'Vielfache schreibt man groß, die Ausnahme ist Kilo mit kleinem k. KiB wäre die binäre Variante mit 1.024 Byte.' },
    { id: 'z9', type: 'mc', q: 'Wie viele Bit stecken in einer Hex-Ziffer (einem Nibble)?', options: ['4', '8', '2', '16'], answer: 0, explain: 'Eine Hex-Ziffer kann 16 Werte annehmen. Dafür braucht man genau 4 Bit, denn 2<sup>4</sup> = 16.' },
    { id: 'z10', type: 'input', q: 'Rechne <b>F08E</b> (hexadezimal) in eine Dezimalzahl um.', accept: ['61582', '61.582'], explain: 'F08E ist binär 1111 0000 1000 1110. Addiert man die Stellen mit einer 1, ergibt das 32768 + 16384 + 8192 + 4096 + 128 + 8 + 4 + 2 = 61.582.' },
    { id: 'z11', type: 'input', q: 'Rechne <b>304</b> (dezimal) in eine Hexadezimalzahl um.', accept: ['130', '130h', '0x130'], explain: '304 : 16 = 19 Rest 0, dann 19 : 16 = 1 Rest 3, dann 1 : 16 = 0 Rest 1. Die Reste von unten nach oben gelesen ergeben 130h.' },
    { id: 'z12', type: 'input', q: 'Rechne <b>0011 1000</b> (binär) in eine Dezimalzahl um.', accept: ['56'], explain: 'Die Einsen stehen bei den Stellenwerten 32, 16 und 8. Zusammen ergibt das 56.' },
    { id: 'z13', type: 'mc', q: 'Wie lang ist eine MAC-Adresse, und wie schreibt man sie meistens?', options: ['48 Bit, als 12 Hex-Ziffern', '32 Bit, als 4 Dezimalzahlen', '64 Bit, als 16 Hex-Ziffern', '128 Bit, als 8 Hex-Blöcke'], answer: 0, explain: 'Eine MAC-Adresse ist 48 Bit (6 Byte) lang. Man schreibt sie als sechs Paare aus je zwei Hex-Ziffern, zum Beispiel F0-79-59-65-F5-56.' },
    { id: 'z14', type: 'mc', q: 'Was ist ein <b>Suffix</b>?', options: ['Eine Nachsilbe, zum Beispiel die Endung .xlsx', 'Eine Vorsilbe, zum Beispiel Kilo-', 'Die Kennzeichnung einer Hex-Zahl', 'Ein Stellenwert'], answer: 0, explain: 'Ein Suffix steht hinten, ein Präfix steht vorne. „Kilo“ in Kilobyte ist also ein Präfix, „.docx“ in einem Dateinamen ein Suffix.' },
    { id: 'z15', type: 'multi', q: 'Welche dieser Werte sind <b>gleich</b> 255?', options: ['FF<sub>16</sub>', '1111 1111<sub>2</sub>', '2<sup>8</sup>', '377<sub>8</sub>'], answer: [0, 1, 3], explain: 'FF, 1111 1111 und 377 im Achtersystem (3 · 64 + 7 · 8 + 7) ergeben alle 255. 2<sup>8</sup> ist dagegen 256.' },
    { id: 'z16', type: 'input', q: 'Wie viele <b>Byte</b> hat <b>1 GiB</b>?', accept: ['1073741824', '1.073.741.824'], explain: '1 GiB sind 2<sup>30</sup> Byte. Das sind 1.073.741.824 Byte.' },
    { id: 'z17', type: 'mc', q: 'Welche Stellenwerte hat ein Oktett, von links nach rechts gelesen?', options: ['128, 64, 32, 16, 8, 4, 2, 1', '1, 2, 4, 8, 16, 32, 64, 128', '256, 128, 64, 32, 16, 8, 4, 2', '100, 50, 25, 12, 6, 3, 2, 1'], answer: 0, explain: 'Ganz rechts steht 2<sup>0</sup> = 1, ganz links 2<sup>7</sup> = 128. Jede Stelle nach links verdoppelt den Wert.' },
    { id: 'z18', type: 'mc', q: 'Wie rechnet man mit dem <b>Restwertverfahren</b> eine Dezimalzahl in Hexadezimal um?', options: ['Immer wieder durch 16 teilen und die Reste von unten nach oben lesen', 'Immer wieder mit 16 malnehmen und die Ergebnisse addieren', 'Durch 2 teilen und die Reste von oben nach unten lesen', 'Die Ziffern einzeln durch 16 teilen'], answer: 0, explain: 'Man teilt so lange durch 16, bis 0 herauskommt. Der letzte Rest ist die vorderste Ziffer, deshalb liest man von unten nach oben.' },
    { id: 'z19', type: 'mc', q: 'Wie rechnet man eine Binärzahl am schnellsten in Hexadezimal um?', options: ['In Vierergruppen teilen und jede Gruppe einzeln in eine Hex-Ziffer umrechnen', 'Erst in Dezimal und dann in Oktal umrechnen', 'In Achtergruppen teilen und jede durch 16 teilen', 'Die Einsen zählen'], answer: 0, explain: 'Eine Hex-Ziffer steht für genau 4 Bit. Aus 1111 0000 wird so F0.' },
  ],
  pairs: [
    { title: 'Binär und Dezimal', items: [['1000 0000', '128'], ['1100 0000', '192'], ['1110 0000', '224'], ['1111 0000', '240'], ['1111 1000', '248'], ['1111 1100', '252']] },
    { title: 'Präfixe und ihr Wert', items: [['1 kB', '1.000 Byte'], ['1 KiB', '1.024 Byte'], ['1 MB', '1.000.000 Byte'], ['1 MiB', '1.048.576 Byte'], ['1 Byte', '8 Bit'], ['2<sup>10</sup>', '1.024']] },
  ],
};

export const subnetting = {
  id: 'subnetting', title: 'Subnetting', color: '#2D6CDF',
  blurb: 'Ein großes IP-Netz in kleinere Netze aufteilen und mehrere kleine wieder zusammenfassen.',
  pruefung: 'Subnetting kommt in Teil 1 und Teil 2 regelmäßig vor, meist als Rechenaufgabe mit Netzplan: Netzadresse, Broadcast, Hostbereich und passende Maske bestimmen. Übe, bis du die Blockgrößen ohne Nachdenken parat hast.',
  gens: ['cidr2mask', 'mask2cidr', 'hosts', 'netid', 'broadcast', 'firsthost', 'lasthost', 'split', 'needhosts', 'whichsubnet', 'nthsubnet', 'supernet'],
  learn: [
    {
      h: 'Warum man Netze aufteilt',
      html: `<p>Beim Subnetting teilt man einen großen IP-Adressbereich in mehrere kleinere Netze auf. Man nennt das auch Netzsegmentierung.</p>
      <p>Der wichtigste Grund sind <b>Broadcasts</b>. Ein Broadcast ist eine Nachricht an alle Geräte im selben Netz. Geräte nutzen das zum Beispiel, um per <b>ARP</b> die MAC-Adresse zu einer IP-Adresse zu finden oder um per <b>DHCP</b> eine IP-Adresse zu bekommen. Jedes Gerät im Netz muss jeden Broadcast verarbeiten. In einem großen Netz mit vielen Geräten bremst das die Geräte und das Netz aus.</p>
      <p>Router leiten Broadcasts nicht weiter. Teilt man ein Netz auf, wird also jede <b>Broadcast-Domäne</b> kleiner.</p>
      <p>Eine Broadcast-Domäne ist der Bereich, den ein Broadcast erreicht. Innerhalb davon sind die Geräte über Hubs, Switches oder Bridges verbunden, also über Geräte der Schichten 1 und 2. Auf Schicht 2 hat ein Broadcast die Ziel-MAC-Adresse FF:FF:FF:FF:FF:FF. Unterteilen lässt sich eine Broadcast-Domäne nur mit Mitteln ab Schicht 3: mit Routern, mit Subnetzen oder mit VLANs.</p>
      <p> Außerdem lassen sich Netze so sinnvoll ordnen, zum Beispiel nach Stockwerk, nach Abteilung oder nach Gerätetyp wie Drucker.</p>`,
    },
    {
      h: 'Netzanteil und Hostanteil',
      html: `<p>Eine IPv4-Adresse besteht aus 32 Bit. Der vordere Teil sagt, in welchem Netz ein Gerät steht (<b>Netzanteil</b>). Der hintere Teil bezeichnet das einzelne Gerät in diesem Netz (<b>Hostanteil</b>).</p>
      <p>Wo die Grenze liegt, bestimmt die <b>Subnetzmaske</b>. Sie besteht von links aus Einsen (Netzanteil) und danach aus Nullen (Hostanteil). Statt der ganzen Maske schreibt man oft nur die Anzahl der Einsen als <b>Präfix</b>, zum Beispiel /24. Diese Schreibweise heißt CIDR.</p>
      <div class="rechnung"><p>/24 = 255.255.255.0</p><p class="mono">11111111.11111111.11111111.00000000</p><p>24 Bit Netzanteil, 8 Bit Hostanteil.</p></div>
      <p>Liegt die Grenze mitten in einem Oktett, hilft diese Reihe. Sie zeigt den Wert des Oktetts für 1 bis 8 Einsen:</p>
      <table><tr><th>Einsen</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td></tr><tr><th>Wert</th><td>128</td><td>192</td><td>224</td><td>240</td><td>248</td><td>252</td><td>254</td><td>255</td></tr></table>`,
    },
    {
      h: 'Wie viele Hosts passen in ein Netz?',
      html: `<p>Die Anzahl der Hostbits ist 32 minus Präfix. Mit diesen Bits lassen sich 2<sup>Hostbits</sup> Adressen bilden. Zwei davon kann man aber keinem Gerät geben:</p>
      <ul><li>Die <b>Netzadresse</b>: alle Hostbits sind 0. Sie bezeichnet das Netz selbst und ist immer die erste Adresse des Subnetzes.</li><li>Die <b>Broadcastadresse</b>: alle Hostbits sind 1. Sie erreicht alle Geräte im Netz und ist immer die letzte Adresse des Subnetzes.</li></ul>
      <div class="merke"><b>Formel:</b> Nutzbare Hosts = 2<sup>Hostbits</sup> − 2. Beispiel /26: 6 Hostbits, also 2<sup>6</sup> − 2 = 62 Hosts.</div>
      <p>Das Default-Gateway ist übrigens ein ganz normaler Host und verbraucht eine dieser nutzbaren Adressen.</p>`,
    },
    {
      h: 'Netzadresse und Broadcast finden',
      html: `<p>Am schnellsten geht das mit der <b>Blockgröße</b>, oft „magische Zahl“ genannt. Du nimmst das Oktett, in dem die Grenze der Maske liegt, und rechnest 256 minus den Maskenwert in diesem Oktett. Die Subnetze beginnen dann immer bei einem Vielfachen dieser Zahl.</p>
      <div class="rechnung"><p>Beispiel: 192.168.5.77/27</p><p>/27 bedeutet im letzten Oktett 224. Blockgröße: 256 − 224 = 32.</p><p>Die Subnetze beginnen bei 0, 32, 64, 96 … Die 77 liegt im Block von 64 bis 95.</p><p>Netzadresse <b>192.168.5.64</b>, erster Host 192.168.5.65, letzter Host 192.168.5.94, Broadcast <b>192.168.5.95</b>.</p></div>`,
    },
    {
      h: 'Ein Netz in Subnetze aufteilen',
      html: `<p>Um ein Netz aufzuteilen, „leiht“ man sich Bits aus dem Hostanteil und schlägt sie dem Netzanteil zu. Mit n geliehenen Bits entstehen 2<sup>n</sup> Subnetze. Dafür hat jedes Subnetz weniger Hosts.</p>
      <div class="rechnung"><p>Beispiel: 192.168.0.0/24 soll in 8 gleich große Netze geteilt werden.</p><p>2<sup>3</sup> = 8, also werden 3 Bit geliehen. Das neue Präfix ist /24 + 3 = /27.</p><p>Jedes Subnetz hat 2<sup>5</sup> − 2 = 30 Hosts. Die Netze beginnen bei .0, .32, .64, .96, .128, .160, .192 und .224.</p></div>
      <p>In einer typischen Prüfungsfrage wird zusätzlich gefragt, wie viele Hosts man in allen Subnetzen zusammen nutzen kann. Im Beispiel oben sind das 8 Subnetze mal 30 Hosts, also 240. Gegenüber dem ungeteilten /24 mit 254 Hosts verliert man 14 Adressen, weil jedes Subnetz eine eigene Netz- und Broadcastadresse braucht.</p>
      <p>Braucht man eine Anzahl, die keine Zweierpotenz ist, zum Beispiel 5 Netze, nimmt man die nächstgrößere Zweierpotenz. Für 5 Netze braucht man also 3 Bit (8 Netze), und 3 Netze bleiben als Reserve.</p>
      <p>Früher teilte man nur an den Oktettgrenzen: /8 (Klasse A), /16 (Klasse B) und /24 (Klasse C). Heute arbeitet man klassenlos und kann die Grenze an jedes Bit setzen.</p>`,
    },
    {
      h: 'VLSM: unterschiedlich große Subnetze',
      html: `<p>Wenn alle Subnetze gleich groß sind, verschwendet man oft Adressen. Eine Verbindung zwischen zwei Routern braucht zum Beispiel nur 2 Adressen, eine Abteilung vielleicht 100. Mit <b>VLSM</b> (Variable Length Subnet Masks) bekommt jedes Subnetz genau die Größe, die es braucht.</p>
      <div class="merke"><b>Regel:</b> Bei VLSM vergibt man die Subnetze immer vom größten zum kleinsten. Sonst liegen die großen Blöcke nicht an passenden Grenzen und es entstehen Überschneidungen oder Lücken.</div>`,
    },
    {
      h: 'Supernetting: Netze zusammenfassen',
      html: `<p>Supernetting ist das Gegenteil von Subnetting. Mehrere kleine Netze werden zu einem größeren zusammengefasst, das ein kürzeres Präfix hat. Das Ziel: Ein Router braucht dann statt vieler Einträge nur noch einen in seiner Routing-Tabelle.</p>
      <p>Das funktioniert nur, wenn die Netze direkt aufeinander folgen und binär zusammenpassen. Außerdem muss CIDR unterstützt werden.</p>
      <div class="rechnung"><p>Beispiel: 192.168.0.0/24 bis 192.168.3.0/24</p><p class="mono">0 = 000000<b>00</b><br>1 = 000000<b>01</b><br>2 = 000000<b>10</b><br>3 = 000000<b>11</b></p><p>Im dritten Oktett sind die ersten 6 Bit gleich. Zusammen mit den 16 Bit davor sind das 22 gleiche Bit. Das Supernetz ist <b>192.168.0.0/22</b> mit 1.022 nutzbaren Hosts.</p></div>
      <p>Bei IPv6 sind Subnetze in der Regel /64 groß. Dort muss man fast nie Bits leihen, weil es mehr als genug Adressen gibt.</p>`,
    },
  ],
  questions: [
    { id: 's1', type: 'mc', q: 'Was ist das Hauptziel von Subnetting?', options: ['Broadcast-Domänen verkleinern und das Netz ordnen', 'Mehr öffentliche IP-Adressen bekommen', 'Die Übertragungsrate erhöhen', 'MAC-Adressen sparen'], answer: 0, explain: 'Kleinere Netze haben kleinere Broadcast-Domänen. Dadurch müssen weniger Geräte jeden Broadcast verarbeiten. Außerdem lässt sich das Netz nach Standort, Abteilung oder Gerätetyp ordnen.' },
    { id: 's2', type: 'multi', q: 'Wofür werden Broadcasts im lokalen Netz verwendet?', options: ['ARP: die MAC-Adresse zu einer IP finden', 'DHCP: eine IP-Adresse bekommen', 'Routing ins Internet', 'Verschlüsselung'], answer: [0, 1], explain: 'ARP und DHCP sind die typischen Nutzer von Broadcasts. Router leiten Broadcasts nicht weiter, deshalb haben sie mit Routing ins Internet nichts zu tun.' },
    { id: 's3', type: 'input', q: 'Wie viele nutzbare Hosts hat ein <b>/26</b>-Netz?', accept: ['62'], explain: 'Bei /26 bleiben 32 − 26 = 6 Hostbits. Das ergibt 2<sup>6</sup> − 2 = 62 nutzbare Adressen.' },
    { id: 's4', type: 'mc', q: 'Warum zieht man bei der Hostanzahl immer <b>2</b> ab?', options: ['Netzadresse und Broadcastadresse kann man keinem Gerät geben', 'Router und Switch brauchen je eine Adresse', 'Gateway und DNS-Server sind abgezogen', 'Wegen der Prüfsumme'], answer: 0, explain: 'Die Adresse mit lauter Nullen im Hostanteil bezeichnet das Netz, die mit lauter Einsen ist der Broadcast. Das Gateway ist dagegen ein normaler Host.' },
    { id: 's5', type: 'input', q: '192.168.0.0/24 soll in Netze mit mindestens 62 Hosts aufgeteilt werden. Wie lautet die neue <b>Subnetzmaske</b>?', accept: ['255.255.255.192', '/26', '26'], explain: 'Für 62 Hosts braucht man 6 Hostbits, denn 2<sup>6</sup> − 2 = 62. Das Präfix ist dann /26, die Maske 255.255.255.192.' },
    { id: 's6', type: 'input', q: '192.168.0.0/24 wird in <b>8</b> gleich große Subnetze geteilt. In welchem Subnetz liegt <b>192.168.0.230</b>? Gib die Netzadresse an.', accept: ['192.168.0.224'], explain: 'Für 8 Netze leiht man 3 Bit, das ergibt /27 mit der Blockgröße 32. Die Netze beginnen bei 0, 32, 64 … 192 und 224. Die 230 liegt im Block von 224 bis 255.' },
    { id: 's7', type: 'mc', q: 'In welcher Reihenfolge vergibt man Subnetze bei <b>VLSM</b>?', options: ['Vom größten zum kleinsten Netz', 'Vom kleinsten zum größten Netz', 'Alphabetisch nach Abteilung', 'Die Reihenfolge ist egal'], answer: 0, explain: 'Die großen Blöcke kommen zuerst, damit sie an passenden Grenzen liegen. So entstehen keine Überschneidungen und keine Lücken.' },
    { id: 's8', type: 'mc', q: 'Was ist <b>Supernetting</b>?', options: ['Mehrere kleine Netze zu einem größeren zusammenfassen', 'Ein Netz in mehrere kleine aufteilen', 'Ein Netz nur mit öffentlichen Adressen', 'Ein VLAN über mehrere Switche'], answer: 0, explain: 'Beim Supernetting fasst man Netze zusammen. Das Supernetz hat ein kürzeres Präfix. Der Router braucht so weniger Einträge in seiner Tabelle.' },
    { id: 's9', type: 'multi', q: 'Welche Voraussetzungen gelten für Supernetting?', options: ['Die Netze folgen direkt aufeinander', 'Die Netze passen binär zusammen', 'CIDR wird unterstützt', 'Alle Netze liegen im selben VLAN'], answer: [0, 1, 2], explain: 'Laut Unterlagen müssen die Netze aufeinanderfolgen, binär zusammenpassen, und es muss klassenlos mit CIDR gearbeitet werden. VLANs spielen dabei keine Rolle.' },
    { id: 's10', type: 'input', q: 'Fasse 192.168.16.0/24 bis 192.168.19.0/24 zu einem Supernetz zusammen. Gib Netz und CIDR an.', accept: ['192.168.16.0/22'], explain: 'Im dritten Oktett ist 16 = 000100<b>00</b> und 19 = 000100<b>11</b>. Die ersten 6 Bit sind gleich, zusammen mit den 16 Bit davor also 22 Bit. Ergebnis: 192.168.16.0/22.' },
    { id: 's11', type: 'input', q: '10.10.0.0/24 und 10.10.1.0/24 werden zusammengefasst. Wie viele nutzbare Hosts hat das Supernetz?', accept: ['510'], explain: 'Zwei /24-Netze ergeben ein /23. Das hat 9 Hostbits und damit 2<sup>9</sup> − 2 = 510 nutzbare Adressen.' },
    { id: 's12', type: 'input', q: 'Wie lautet das gemeinsame Supernetz von 192.0.2.0/25 und 192.0.2.128/25? Gib Netz und CIDR an.', accept: ['192.0.2.0/24'], explain: 'Zwei /25-Netze sind zusammen genau ein /24-Netz: 192.0.2.0/24.' },
    { id: 's13', type: 'mc', q: 'Welche Subnetzmaske gehört zu <b>/20</b>?', options: ['255.255.240.0', '255.255.248.0', '255.255.255.240', '255.240.0.0'], answer: 0, explain: '/20 sind 8 + 8 + 4 Einsen. Das dritte Oktett ist dann 1111 0000, also 240.' },
    { id: 's14', type: 'mc', q: 'Ein Unternehmen nutzt 172.16.0.0/16 und braucht mindestens <b>100 Subnetze</b>. Welches Präfix bekommen die Subnetze?', options: ['/23', '/22', '/24', '/21'], answer: 0, explain: '2<sup>7</sup> = 128 reicht für 100 Netze. Man leiht also 7 Bit: /16 + 7 = /23. Jedes Subnetz hat dann 510 Hosts.' },
    { id: 's15', type: 'mc', q: '10.0.0.0/8 soll mindestens <b>1000 Subnetze</b> bekommen. Welches Präfix?', options: ['/18', '/17', '/19', '/20'], answer: 0, explain: '2<sup>10</sup> = 1024 reicht für 1000 Netze. Man leiht also 10 Bit: /8 + 10 = /18.' },
    { id: 's16', type: 'tf', q: 'Ein Router leitet Broadcasts normalerweise in andere Netze weiter.', answer: false, explain: 'Router begrenzen Broadcast-Domänen. Genau deshalb macht Subnetting die Broadcast-Domänen kleiner.' },
    { id: 's17', type: 'mc', q: 'Welches Präfix ist bei IPv6 für ein normales Subnetz üblich?', options: ['/64', '/24', '/48', '/128'], answer: 0, explain: 'IPv6-Netze sind in der Regel /64 groß. Bits zu leihen ist dort meist nicht nötig.' },
    { id: 's18', type: 'multi', q: 'Womit lässt sich eine Broadcast-Domäne in kleinere Broadcast-Domänen unterteilen?', options: ['Mit einem Router', 'Mit VLANs', 'Mit Subnetzen', 'Mit einem Switch ohne VLANs'], answer: [0, 1, 2], explain: 'Ein einfacher Switch leitet Broadcasts an alle Ports weiter, er vergrößert die Broadcast-Domäne also eher. Trennen kann man sie erst mit Routern, Subnetzen oder VLANs.' },
    { id: 's19', type: 'tf', q: 'Die Broadcastadresse ist immer die letzte Adresse eines Subnetzes.', answer: true, explain: 'Bei der Broadcastadresse sind alle Hostbits 1. Das ist die höchste Adresse im Subnetz. Die Netzadresse ist entsprechend die erste.' },
    { id: 's20', type: 'input', q: '192.168.30.0/24 wird in <b>8</b> gleich große Subnetze geteilt. Wie viele Host-Adressen kann man in <b>allen 8 Subnetzen zusammen</b> nutzen?', accept: ['240'], explain: 'Für 8 Subnetze leiht man 3 Bit, das ergibt /27 mit 32 Adressen pro Subnetz. Davon sind 30 nutzbar. 8 · 30 = 240.' },
    { id: 's21', type: 'mc', q: 'Wie ist eine IPv4-Adresse aufgebaut?', options: ['32 Bit, dargestellt als vier Oktette mit Werten von 0 bis 255', '48 Bit, dargestellt als sechs Hex-Paare', '128 Bit, dargestellt als acht Hex-Blöcke', '32 Bit, dargestellt als acht Hex-Blöcke'], answer: 0, explain: 'IPv4 hat 32 Bit, aufgeteilt in vier Oktette zu je 8 Bit. Jedes Oktett kann Werte von 0 bis 255 annehmen. 48 Bit hat die MAC-Adresse, 128 Bit eine IPv6-Adresse.' },
    { id: 's22', type: 'mc', q: 'Wie viele Subnetze entstehen, wenn man <b>n Bits</b> aus dem Hostanteil leiht?', options: ['2<sup>n</sup>', '2<sup>n</sup> − 2', 'n · 2', 'n<sup>2</sup>'], answer: 0, explain: 'Mit n Bit lassen sich 2<sup>n</sup> verschiedene Kombinationen bilden, also 2<sup>n</sup> Subnetze. Die −2 gilt nur bei der Anzahl der Hosts.' },
    { id: 's23', type: 'mc', q: 'Wie berechnet man die <b>Blockgröße</b> (magische Zahl) beim Subnetting?', options: ['256 minus den Maskenwert im Oktett, in dem die Grenze liegt', '32 minus das Präfix', '2 hoch Präfix', 'Maskenwert geteilt durch 8'], answer: 0, explain: 'Beispiel /27: Im letzten Oktett steht 224, also 256 − 224 = 32. Die Subnetze beginnen bei 0, 32, 64 und so weiter.' },
  ],
  pairs: [
    { title: 'Präfix und Subnetzmaske', items: [['/25', '255.255.255.128'], ['/26', '255.255.255.192'], ['/27', '255.255.255.224'], ['/28', '255.255.255.240'], ['/29', '255.255.255.248'], ['/30', '255.255.255.252']] },
    { title: 'Präfix und nutzbare Hosts', items: [['/24', '254'], ['/25', '126'], ['/27', '30'], ['/28', '14'], ['/30', '2'], ['/22', '1.022']] },
  ],
};

export const protokollmodelle = {
  id: 'protokollmodelle', title: 'OSI- und TCP/IP-Modell', color: '#2E8B57',
  blurb: 'Zwei Modelle, die Netzwerkkommunikation in Schichten aufteilen, und was auf welcher Schicht passiert.',
  pruefung: 'Schichten zuordnen ist eine typische Aufgabe in Teil 1: Welches Gerät, welches Protokoll und welche Adresse gehört auf welche Schicht? In Teil 2 wird das Modell bei der Fehlersuche vorausgesetzt.',
  gens: [],
  learn: [
    {
      h: 'Wozu ein Schichtenmodell?',
      html: `<p>Damit zwei Rechner Daten austauschen können, müssen viele Dinge zusammenspielen: das Kabel, die Adressierung, die Wegfindung, die Anwendung. Ein Schichtenmodell teilt diese Aufgaben in Ebenen auf. Jede Schicht hat eine klare Aufgabe und verlässt sich auf die Schicht darunter.</p>
      <p>Das <b>OSI-Modell</b> wurde ab 1977 von der ISO entwickelt und 1984 standardisiert. Es hat <b>sieben Schichten</b>, die man meistens mit ihrer Nummer nennt, zum Beispiel „Schicht 3“.</p>`,
    },
    {
      h: 'Die sieben OSI-Schichten',
      html: `<table><tr><th>Nr.</th><th>Deutsch</th><th>Englisch</th><th>Beispiele</th></tr>
      <tr><td>7</td><td>Anwendungsschicht</td><td>Application</td><td>HTTP, DNS, E-Mail</td></tr>
      <tr><td>6</td><td>Darstellungsschicht</td><td>Presentation</td><td>Kodierung, Verschlüsselung, Formate</td></tr>
      <tr><td>5</td><td>Sitzungsschicht</td><td>Session</td><td>Aufbau und Verwaltung von Sitzungen</td></tr>
      <tr><td>4</td><td>Transportschicht</td><td>Transport</td><td>TCP, UDP, Ports</td></tr>
      <tr><td>3</td><td>Vermittlungsschicht</td><td>Network</td><td>IP-Adressen, Router</td></tr>
      <tr><td>2</td><td>Sicherungsschicht</td><td>Data Link</td><td>MAC-Adressen, Switch</td></tr>
      <tr><td>1</td><td>Bitübertragungsschicht</td><td>Physical</td><td>Kabel, Stecker, Signale, Hub</td></tr></table>
      <p>Eine Eselsbrücke für die englischen Namen von unten nach oben: „<b>P</b>lease <b>D</b>o <b>N</b>ot <b>T</b>hrow <b>S</b>ausage <b>P</b>izza <b>A</b>way“.</p>`,
    },
    {
      h: 'Wie die Schichten zusammenarbeiten',
      html: `<p>Beim Sender läuft ein Datenpaket von Schicht 7 nach unten bis Schicht 1. Jede Schicht fügt dabei ihre eigenen Informationen hinzu. Beim Empfänger läuft es von Schicht 1 wieder nach oben, und jede Schicht liest ihre Informationen aus.</p>
      <p>Innerhalb eines Rechners spricht jede Schicht nur mit ihren direkten Nachbarn. Die genormte Schnittstelle dazwischen heißt <b>Service Access Point (SAP)</b>. Keine Schicht wird übersprungen.</p>
      <p>Zwischen zwei Rechnern kommuniziert logisch immer dieselbe Schicht miteinander: die Transportschicht des Senders mit der Transportschicht des Empfängers.</p>
      <p>Je nach Schicht hat die Dateneinheit einen eigenen Namen. Auf Schicht 4 spricht man von einem <b>Segment</b>, auf Schicht 3 von einem <b>Paket</b>, auf Schicht 2 von einem <b>Frame</b> und auf Schicht 1 von <b>Bits</b>.</p>`,
    },
    {
      h: 'Transport- und anwendungsorientierte Schichten',
      html: `<p>Die sieben Schichten werden oft in zwei Gruppen eingeteilt:</p>
      <p>Die <b>transportorientierten Schichten</b> sind die Schichten 1 bis 4. Sie sorgen dafür, dass die Daten überhaupt vom einen Rechner zum anderen kommen.</p>
      <ul><li><b>Schicht 1</b> überträgt die einzelnen Bits über das Medium, also über Kabel oder Funk.</li>
      <li><b>Schicht 2</b> teilt den Bitstrom in Frames auf, ergänzt Prüfsummen und regelt den Zugriff auf das Medium. Fehler bei der Übertragung zwischen zwei direkt verbundenen Geräten werden hier erkannt.</li>
      <li><b>Schicht 3</b> vergibt netzübergreifende Adressen (IPv4, IPv6) und bestimmt den Weg durch die Netze, also das Routing. Hier werden Pakete bei Bedarf auch in kleinere Stücke zerlegt (Fragmentierung).</li>
      <li><b>Schicht 4</b> ordnet die Daten über Portnummern der richtigen Anwendung zu, teilt sie in Segmente auf und sorgt dafür, dass sie vollständig und in der richtigen Reihenfolge ankommen.</li></ul>
      <p>Die <b>anwendungsorientierten Schichten</b> sind die Schichten 5 bis 7. Sie kümmern sich darum, was mit den Daten passiert, wenn sie angekommen sind.</p>
      <ul><li><b>Schicht 5</b> baut Sitzungen zwischen Anwendungen auf, verwaltet sie und beendet sie wieder.</li>
      <li><b>Schicht 6</b> sorgt dafür, dass beide Seiten die Daten im selben Format verstehen. Hier passieren Umwandlung, Kompression und Verschlüsselung.</li>
      <li><b>Schicht 7</b> ist die Schnittstelle zu den Anwendungen und Diensten, die der Benutzer verwendet.</li></ul>`,
    },
    {
      h: 'Das TCP/IP-Modell',
      html: `<p>Das TCP/IP-Modell entstand schon in den 1970er Jahren und ist auch als Internet-Modell bekannt. Es ist ein offener Standard, den kein einzelnes Unternehmen kontrolliert. Es konzentriert sich auf die Kommunikation und hat nur <b>vier Schichten</b>.</p>
      <table><tr><th>TCP/IP-Schicht</th><th>entspricht OSI</th></tr>
      <tr><td>Anwendung</td><td>5, 6 und 7</td></tr>
      <tr><td>Transport</td><td>4</td></tr>
      <tr><td>Internet</td><td>3</td></tr>
      <tr><td>Netzzugang</td><td>1 und 2</td></tr></table>
      <p>Welche Geräte und Protokolle auf welcher Schicht arbeiten, wird in Prüfungen gern abgefragt:</p>
      <table><tr><th>Schicht</th><th>Geräte</th><th>Protokolle</th></tr>
      <tr><td>1 Bitübertragung</td><td>Hub, Repeater (Signalverstärker)</td><td>–</td></tr>
      <tr><td>2 Sicherung</td><td>Layer-2-Switch, Bridge</td><td>Ethernet, ARP arbeitet zwischen Schicht 2 und 3</td></tr>
      <tr><td>3 Vermittlung</td><td>Router, Layer-3-Switch</td><td>IP, ICMP (zum Beispiel ping), IPsec</td></tr>
      <tr><td>4 Transport</td><td>–</td><td>TCP, UDP</td></tr></table>
      <div class="merke"><b>Kurz gesagt:</b> Hub und Repeater auf Schicht 1, Switch und Bridge auf Schicht 2, Router auf Schicht 3.</div>`,
    },
  ],
  questions: [
    { id: 'o1', type: 'mc', q: 'Wie viele Schichten hat das OSI-Modell?', options: ['7', '4', '5', '8'], answer: 0, explain: 'Das OSI-Modell hat sieben Schichten. Das TCP/IP-Modell hat vier.' },
    { id: 'o2', type: 'mc', q: 'Auf welcher OSI-Schicht arbeitet ein klassischer <b>Switch</b>?', options: ['Schicht 2, Sicherung', 'Schicht 1, Bitübertragung', 'Schicht 3, Vermittlung', 'Schicht 4, Transport'], answer: 0, explain: 'Ein Switch entscheidet anhand der MAC-Adressen, wohin ein Frame geht. MAC-Adressen gehören zur Schicht 2. Layer-3-Switche können zusätzlich routen.' },
    { id: 'o3', type: 'mc', q: 'Auf welcher OSI-Schicht arbeitet ein <b>Router</b>?', options: ['Schicht 3, Vermittlung', 'Schicht 2, Sicherung', 'Schicht 4, Transport', 'Schicht 7, Anwendung'], answer: 0, explain: 'Ein Router leitet Pakete anhand der IP-Adresse weiter. IP gehört zur Vermittlungsschicht.' },
    { id: 'o4', type: 'mc', q: 'Welche Schicht ist für <b>Ports</b> und die Verbindung zwischen zwei Anwendungen zuständig?', options: ['Transportschicht (4)', 'Sitzungsschicht (5)', 'Vermittlungsschicht (3)', 'Darstellungsschicht (6)'], answer: 0, explain: 'TCP und UDP sind Protokolle der Transportschicht. Über Ports sprechen sie die richtige Anwendung auf einem Rechner an.' },
    { id: 'o5', type: 'mc', q: 'Wie heißt die Schnittstelle zwischen zwei benachbarten OSI-Schichten?', options: ['Service Access Point (SAP)', 'Default-Gateway', 'Socket', 'Port'], answer: 0, explain: 'Über den Service Access Point tauschen zwei benachbarte Schichten innerhalb eines Rechners Informationen aus.' },
    { id: 'o6', type: 'tf', q: 'Eine Schicht im OSI-Modell darf übersprungen werden, wenn sie nicht gebraucht wird.', answer: false, explain: 'Ein Datenpaket durchläuft immer alle Schichten. Jede Schicht spricht nur mit ihren direkten Nachbarn.' },
    { id: 'o7', type: 'mc', q: 'Welche Organisation hat das OSI-Modell entwickelt?', options: ['ISO', 'IEEE', 'IETF', 'Cisco'], answer: 0, explain: 'Die ISO hat das Modell ab 1977 entwickelt und 1984 standardisiert.' },
    { id: 'o8', type: 'mc', q: 'Wie viele Schichten hat das TCP/IP-Modell?', options: ['4', '7', '5', '3'], answer: 0, explain: 'Die vier Schichten sind Netzzugang, Internet, Transport und Anwendung.' },
    { id: 'o9', type: 'mc', q: 'Welche OSI-Schichten fasst die TCP/IP-<b>Anwendungsschicht</b> zusammen?', options: ['5, 6 und 7', 'Nur 7', '4 bis 7', '6 und 7'], answer: 0, explain: 'Sitzung, Darstellung und Anwendung sind im TCP/IP-Modell zu einer Anwendungsschicht zusammengefasst.' },
    { id: 'o10', type: 'mc', q: 'Welche OSI-Schichten entsprechen der TCP/IP-Schicht <b>Netzzugang</b>?', options: ['1 und 2', 'Nur 1', '2 und 3', '1 bis 3'], answer: 0, explain: 'Der Netzzugang umfasst die Bitübertragung (Schicht 1) und die Sicherung (Schicht 2).' },
    { id: 'o11', type: 'mc', q: 'Wie heißt die Dateneinheit auf <b>Schicht 2</b>?', options: ['Frame', 'Paket', 'Segment', 'Bit'], answer: 0, explain: 'Auf Schicht 4 heißt sie Segment, auf Schicht 3 Paket, auf Schicht 2 Frame und auf Schicht 1 sind es Bits.' },
    { id: 'o12', type: 'mc', q: 'Wie heißt OSI-Schicht 6 auf Englisch?', options: ['Presentation Layer', 'Session Layer', 'Application Layer', 'Transport Layer'], answer: 0, explain: 'Schicht 6 ist die Darstellungsschicht, also der Presentation Layer. Schicht 5 ist der Session Layer.' },
    { id: 'o13', type: 'mc', q: 'Auf welcher Schicht arbeitet ein <b>Hub</b>?', options: ['Schicht 1', 'Schicht 2', 'Schicht 3', 'Schicht 7'], answer: 0, explain: 'Ein Hub wertet keine Adressen aus. Er verstärkt nur das Signal und gibt es an alle Anschlüsse weiter.' },
    { id: 'o14', type: 'tf', q: 'Das TCP/IP-Modell ist ein offener Standard, den kein einzelnes Unternehmen kontrolliert.', answer: true, explain: 'So steht es auch in den Unterlagen. Alle TCP/IP-Protokolle folgen diesem Modell.' },
    { id: 'o15', type: 'mc', q: 'Zu welcher OSI-Schicht gehört das Protokoll <b>IP</b>?', options: ['Schicht 3', 'Schicht 4', 'Schicht 2', 'Schicht 5'], answer: 0, explain: 'IP ist das zentrale Protokoll der Vermittlungsschicht.' },
    { id: 'o16', type: 'mc', q: 'Welche Schichten des OSI-Modells nennt man <b>transportorientiert</b>?', options: ['Die Schichten 1 bis 4', 'Die Schichten 5 bis 7', 'Nur Schicht 4', 'Die Schichten 1 bis 3'], answer: 0, explain: 'Die Schichten 1 bis 4 sorgen dafür, dass die Daten beim anderen Rechner ankommen. Die Schichten 5 bis 7 heißen anwendungsorientiert.' },
    { id: 'o17', type: 'mc', q: 'Welche Schichten des OSI-Modells nennt man <b>anwendungsorientiert</b>?', options: ['Die Schichten 5 bis 7', 'Die Schichten 1 bis 4', 'Nur Schicht 7', 'Die Schichten 4 bis 7'], answer: 0, explain: 'Sitzung, Darstellung und Anwendung kümmern sich darum, was mit den Daten passiert, wenn sie angekommen sind.' },
    { id: 'o18', type: 'multi', q: 'Welche Protokolle arbeiten auf der <b>Vermittlungsschicht</b> (Schicht 3)?', options: ['IP', 'ICMP', 'IPsec', 'TCP'], answer: [0, 1, 2], explain: 'IP, ICMP und IPsec gehören zu Schicht 3. TCP und UDP arbeiten eine Schicht höher, auf der Transportschicht.' },
    { id: 'o19', type: 'mc', q: 'Auf welcher Schicht arbeitet eine <b>Bridge</b>?', options: ['Schicht 2', 'Schicht 1', 'Schicht 3', 'Schicht 4'], answer: 0, explain: 'Eine Bridge verbindet Netzsegmente anhand von MAC-Adressen, genau wie ein Switch. Damit gehört sie zur Sicherungsschicht.' },
    { id: 'o20', type: 'mc', q: 'Auf welcher Schicht arbeitet ein <b>Repeater</b>?', options: ['Schicht 1', 'Schicht 2', 'Schicht 3', 'Schicht 7'], answer: 0, explain: 'Ein Repeater verstärkt nur das Signal, ohne Adressen auszuwerten. Wie der Hub gehört er zur Bitübertragungsschicht.' },
    { id: 'o21', type: 'mc', q: 'Auf welcher Schicht werden Daten über <b>Portnummern</b> einer Anwendung zugeordnet und in <b>Segmente</b> aufgeteilt?', options: ['Schicht 4', 'Schicht 3', 'Schicht 2', 'Schicht 5'], answer: 0, explain: 'Das ist die Aufgabe der Transportschicht mit TCP und UDP.' },
    { id: 'o22', type: 'mc', q: 'Wie heißt OSI-Schicht 2 auf Englisch?', options: ['Data Link Layer', 'Network Layer', 'Physical Layer', 'Session Layer'], answer: 0, explain: 'Schicht 1 ist der Physical Layer, Schicht 2 der Data Link Layer und Schicht 3 der Network Layer.' },
    { id: 'o23', type: 'mc', q: 'Wie heißen die vier Schichten des TCP/IP-Modells von unten nach oben?', options: ['Netzzugang, Internet, Transport, Anwendung', 'Bitübertragung, Sicherung, Vermittlung, Anwendung', 'Netzzugang, Transport, Internet, Anwendung', 'Physical, Network, Session, Application'], answer: 0, explain: 'Netzzugang entspricht OSI 1 und 2, Internet entspricht OSI 3, Transport OSI 4 und Anwendung OSI 5 bis 7.' },
  ],
  pairs: [
    { title: 'OSI-Nummer und Name', items: [['Schicht 1', 'Bitübertragung'], ['Schicht 2', 'Sicherung'], ['Schicht 3', 'Vermittlung'], ['Schicht 4', 'Transport'], ['Schicht 5', 'Sitzung'], ['Schicht 6', 'Darstellung'], ['Schicht 7', 'Anwendung']] },
    { title: 'Gerät und Schicht', items: [['Hub', 'Schicht 1'], ['Repeater', 'Schicht 1'], ['Bridge', 'Schicht 2'], ['Layer-2-Switch', 'Schicht 2'], ['Router', 'Schicht 3'], ['Layer-3-Switch', 'Schicht 3']] },
    { title: 'Was gehört auf welche Schicht?', items: [['HTTP', 'Schicht 7'], ['TCP', 'Schicht 4'], ['IP', 'Schicht 3'], ['MAC-Adresse', 'Schicht 2'], ['Patchkabel', 'Schicht 1'], ['Router', 'Schicht 3']] },
  ],
  order: [
    { title: 'Sortiere die OSI-Schichten von unten (1) nach oben (7)', items: ['Bitübertragung', 'Sicherung', 'Vermittlung', 'Transport', 'Sitzung', 'Darstellung', 'Anwendung'] },
    { title: 'Sortiere die TCP/IP-Schichten von unten nach oben', items: ['Netzzugang', 'Internet', 'Transport', 'Anwendung'] },
  ],
};
