// Netzwerktechnik – Teil 3: Routing, NAT/PAT, VPN

export const routing = {
  id: 'routing', title: 'Routing', color: '#E07020',
  blurb: 'Wie Router den Weg für ein Paket finden: Routing-Tabelle, statische und dynamische Routen.',
  gens: ['samenet'],
  learn: [
    {
      h: 'Was ein Router macht',
      html: `<p>Ein Router verbindet verschiedene Netze miteinander. Er entscheidet anhand der <b>Ziel-IP-Adresse</b>, wohin ein Paket als Nächstes geschickt wird. Damit arbeitet er auf Schicht 3 des OSI-Modells. Für die Geräte im lokalen Netz ist der Router das <b>Default-Gateway</b>: das Tor nach draußen.</p>
      <p>Technisch ist ein Router ein spezialisierter Computer mit Prozessor, Betriebssystem, Arbeitsspeicher und Flash-Speicher. Er kann auch Netze mit ganz unterschiedlicher Technik verbinden, zum Beispiel ein Ethernet-LAN mit einem DSL-Anschluss. Router werden außerdem eingesetzt, um Standorte über VPN sicher miteinander zu koppeln.</p>
      <div class="merke"><b>Switch oder Router?</b> Ein Switch leitet Frames <b>innerhalb</b> eines Netzes weiter und arbeitet mit MAC-Adressen auf Schicht 2. Ein Router leitet Pakete <b>zwischen</b> verschiedenen Netzen weiter und arbeitet mit IP-Adressen auf Schicht 3.</div>`,
    },
    {
      h: 'Die Entscheidung beim Absender',
      html: `<p>Bevor ein PC ein Paket verschickt, prüft er mit seiner Subnetzmaske, ob das Ziel im eigenen Netz liegt.</p>
      <ul><li>Liegt das Ziel <b>im eigenen Netz</b>, schickt er das Paket direkt an das Zielgerät.</li>
      <li>Liegt das Ziel <b>in einem anderen Netz</b>, schickt er es an sein Default-Gateway.</li></ul>
      <p>Im zweiten Fall steht als Ziel-IP weiterhin die Adresse des eigentlichen Ziels im Paket. Als Ziel-MAC trägt der PC aber die MAC-Adresse des Routers ein. Diese findet er per ARP heraus.</p>`,
    },
    {
      h: 'Was im Router passiert',
      html: `<ol><li>Der Router empfängt den Frame und packt das IP-Paket aus (Decapsulation).</li>
      <li>Er vergleicht die Ziel-IP mit seiner <b>Routing-Tabelle</b> und wählt den besten Weg.</li>
      <li>Er packt das Paket in einen neuen Frame für die nächste Strecke (Encapsulation). Die Art des Frames hängt von der Leitung ab, zum Beispiel Ethernet oder PPP.</li>
      <li>Er schickt das Paket über das passende Interface weiter.</li></ol>
      <div class="merke"><b>Merke:</b> Die IP-Adressen bleiben auf dem ganzen Weg gleich (solange kein NAT dazwischen ist). Die MAC-Adressen ändern sich auf jeder Teilstrecke.</div>`,
    },
    {
      h: 'Die Routing-Tabelle lesen',
      html: `<p>Ein Eintrag in der Routing-Tabelle sagt: „Um dieses Zielnetz zu erreichen, schicke das Paket an diesen nächsten Router (Next Hop) oder über dieses Interface.“ Bei Cisco steht am Anfang jeder Zeile ein Buchstabe, der zeigt, woher der Eintrag stammt:</p>
      <table><tr><th>Code</th><th>Bedeutung</th></tr>
      <tr><td>C</td><td>connected: ein Netz, das direkt am Router hängt</td></tr>
      <tr><td>L</td><td>local: die eigene IP-Adresse des Interfaces (als /32)</td></tr>
      <tr><td>S</td><td>static: vom Administrator eingetragen</td></tr>
      <tr><td>R, O, D</td><td>dynamisch gelernt über RIP, OSPF oder EIGRP</td></tr>
      <tr><td>*</td><td>Kandidat für die Default-Route</td></tr></table>
      <div class="rechnung"><p class="mono">S 10.10.10.16/29 [1/0] via 10.0.0.13</p><p>Statische Route zum Netz 10.10.10.16/29. In der Klammer steht zuerst die administrative Distanz (1), dann die Metrik (0). Das nächste Ziel auf dem Weg ist 10.0.0.13.</p></div>
      <p>Anzeigen lässt sich die Tabelle unter Windows mit <span class="mono">route print</span> oder <span class="mono">netstat -r</span>, auf Cisco-Routern mit <span class="mono">show ip route</span>.</p>`,
    },
    {
      h: 'Woher die Einträge kommen',
      html: `<p><b>Direkt verbundene Netze</b> trägt der Router selbst ein, sobald ein Interface eine IP-Adresse hat und eingeschaltet ist (bei Cisco mit <span class="mono">no shutdown</span>). Pro Interface entstehen dann eine C-Route und eine L-Route.</p>
      <p><b>Statische Routen</b> trägt der Administrator von Hand ein:</p>
      <div class="rechnung"><p class="mono">ip route 192.168.11.0 255.255.255.0 209.165.200.225</p><p>Eine besondere statische Route ist die <b>Default-Route</b>. Sie passt auf jedes Ziel und wird genommen, wenn nichts Genaueres passt:</p><p class="mono">ip route 0.0.0.0 0.0.0.0 s0/0/1</p></div>
      <p>Statische Routen sind einfach, sicher und gut zu kontrollieren. Dafür ist jeder Eintrag Handarbeit. Fällt eine Leitung aus, reagiert der Router nicht von selbst. Deshalb eignen sie sich vor allem für kleine Netze.</p>
      <p><b>Dynamische Routen</b> lernt der Router über ein Routing-Protokoll von seinen Nachbarn. Er passt sich dann automatisch an, wenn sich das Netz ändert oder eine Leitung ausfällt. Das ist für große Netze nötig, aber komplexer, braucht mehr Rechenleistung und muss zusätzlich abgesichert werden.</p>`,
    },
    {
      h: 'Metrik und administrative Distanz',
      html: `<p>Gibt es mehrere Wege zum selben Ziel, muss der Router entscheiden. Dafür gibt es zwei Werte, und bei beiden gilt: <b>kleiner ist besser</b>.</p>
      <p>Die <b>Metrik</b> vergleicht Wege innerhalb desselben Routing-Protokolls. Jedes Protokoll berechnet sie anders, zum Beispiel aus der Anzahl der Router bis zum Ziel (Hops) oder aus der Bandbreite.</p>
      <p>Die <b>administrative Distanz (AD)</b> vergleicht verschiedene Quellen. Sie sagt, wie sehr der Router einer Informationsquelle vertraut. Kennt er ein Netz zum Beispiel statisch und über OSPF, gewinnt die statische Route.</p>
      <table><tr><th>Quelle</th><th>AD</th></tr><tr><td>direkt verbunden</td><td>0</td></tr><tr><td>statisch</td><td>1</td></tr><tr><td>EIGRP</td><td>90</td></tr><tr><td>OSPF</td><td>110</td></tr><tr><td>RIP</td><td>120</td></tr></table>
      <p>Haben zwei Wege genau dieselben Kosten, verteilt der Router die Pakete gleichmäßig auf beide. EIGRP kann sogar Wege mit unterschiedlichen Kosten gemeinsam nutzen.</p>`,
    },
    {
      h: 'Routing-Protokolle',
      html: `<p>Man unterscheidet zwei Arten:</p>
      <p><b>Distance Vector</b>: Jeder Router schickt seine Routing-Tabelle regelmäßig an seine direkten Nachbarn. Man kann es sich so merken: „Erzähl deinen Nachbarn, wie die Welt für dich aussieht.“ Beispiele sind RIP und EIGRP.</p>
      <p><b>Link State</b>: Jeder Router schickt Informationen über seine eigenen Verbindungen (Link State Advertisements) an alle anderen Router. So kennt jeder Router das ganze Netz und berechnet mit dem Shortest-Path-First-Algorithmus selbst die besten Wege. Merksatz: „Erzähl der ganzen Welt, wer deine Nachbarn sind.“ Beispiele sind OSPF und IS-IS.</p>
      <p>Weil bei Link State jeder Router das ganze Netz kennt, reagiert er schneller auf Änderungen. Man sagt: Link-State-Protokolle <b>konvergieren schneller</b>. Konvergenz heißt, dass alle Router nach einer Änderung wieder dasselbe, richtige Bild vom Netz haben. Dafür brauchen sie mehr Arbeitsspeicher und Rechenleistung.</p>
      <table><tr><th>Protokoll</th><th>Art</th><th>Besonderheiten</th></tr>
      <tr><td>RIP</td><td>Distance Vector</td><td>Metrik ist die Anzahl der Hops. Höchstens 15 Hops, 16 bedeutet „nicht erreichbar“. Austausch alle 30 Sekunden. Erst RIPv2 überträgt Subnetzmasken.</td></tr>
      <tr><td>OSPF</td><td>Link State</td><td>Schleifenfrei, unterstützt VLSM und CIDR, für große Netze geeignet, gliedert das Netz in Bereiche (Areas).</td></tr>
      <tr><td>EIGRP</td><td>Distance Vector (erweitert)</td><td>Von Cisco. Die Metrik setzt sich aus Bandbreite, Verzögerung, Last und Zuverlässigkeit zusammen.</td></tr></table>`,
    },
  ],
  questions: [
    { id: 'r1', type: 'mc', q: 'Anhand welcher Information leitet ein Router ein Paket weiter?', options: ['Ziel-IP-Adresse', 'Quell-MAC-Adresse', 'Ziel-MAC-Adresse', 'Quell-Port'], answer: 0, explain: 'Der Router vergleicht die Ziel-IP-Adresse mit seiner Routing-Tabelle und wählt so den Weg.' },
    { id: 'r2', type: 'mc', q: 'PC1 hat die Adresse 192.168.1.10/24 und sendet an 10.0.0.5. Welche <b>Ziel-MAC-Adresse</b> trägt PC1 in den Frame ein?', options: ['Die MAC-Adresse des Default-Gateways', 'Die MAC-Adresse von 10.0.0.5', 'FF:FF:FF:FF:FF:FF', 'Seine eigene MAC-Adresse'], answer: 0, explain: 'Das Ziel liegt in einem anderen Netz. Deshalb geht der Frame an den Router. Die Ziel-IP im Paket bleibt trotzdem 10.0.0.5.' },
    { id: 'r3', type: 'mc', q: 'Was bedeutet der Buchstabe <b>C</b> in der Ausgabe von <span class="mono">show ip route</span>?', options: ['Ein direkt angeschlossenes Netz', 'Eine Cisco-Route', 'Eine statische Route', 'Ein Kandidat für die Default-Route'], answer: 0, explain: 'C steht für connected. L steht für die eigene IP-Adresse des Interfaces.' },
    { id: 'r4', type: 'mc', q: 'Was bedeutet der Buchstabe <b>S</b> in der Routing-Tabelle?', options: ['Eine statische Route', 'Ein Subnetz', 'Ein Switch', 'Shortest Path'], answer: 0, explain: 'S steht für static: Der Administrator hat die Route von Hand eingetragen.' },
    { id: 'r5', type: 'mc', q: 'Was bedeutet der Buchstabe <b>O</b> in der Routing-Tabelle?', options: ['Die Route wurde über OSPF gelernt', 'Die Route ist offline', 'Die Route führt nach außen', 'Die Route ist überlastet'], answer: 0, explain: 'O steht für OSPF. D steht für EIGRP und R für RIP.' },
    { id: 'r6', type: 'mc', q: 'Wie trägt man auf einem Cisco-Router eine statische <b>Default-Route</b> ein?', options: ['ip route 0.0.0.0 0.0.0.0 &lt;next-hop&gt;', 'ip route default &lt;next-hop&gt;', 'ip default-gateway 0.0.0.0', 'route add 0.0.0.0'], answer: 0, explain: 'Das Netz 0.0.0.0 mit der Maske 0.0.0.0 passt auf jede Adresse. Deshalb greift diese Route, wenn nichts Genaueres passt.' },
    { id: 'r7', type: 'mc', q: 'Welche Metrik verwendet <b>RIP</b>?', options: ['Die Anzahl der Hops', 'Die Bandbreite', 'Die Verzögerung', 'Eine Kombination aus Bandbreite und Last'], answer: 0, explain: 'RIP zählt nur, wie viele Router zwischen Quelle und Ziel liegen.' },
    { id: 'r8', type: 'mc', q: 'Welcher Hop-Wert bedeutet bei RIP „nicht erreichbar“?', options: ['16', '15', '255', '0'], answer: 0, explain: 'RIP erlaubt höchstens 15 Hops. Der Wert 16 gilt als unendlich weit weg.' },
    { id: 'r9', type: 'mc', q: 'Wie oft tauscht RIP seine Routing-Tabelle aus?', options: ['Alle 30 Sekunden', 'Alle 90 Sekunden', 'Nur bei Änderungen', 'Einmal pro Stunde'], answer: 0, explain: 'RIP schickt seine Tabelle regelmäßig alle 30 Sekunden an die Nachbarn.' },
    { id: 'r10', type: 'mc', q: 'Welches dieser Protokolle ist ein <b>Link-State</b>-Protokoll?', options: ['OSPF', 'RIP', 'RIPv2', 'IGRP'], answer: 0, explain: 'OSPF und IS-IS sind Link-State-Protokolle. RIP, IGRP und EIGRP gehören zu Distance Vector.' },
    { id: 'r11', type: 'mc', q: 'Mit welchem Verfahren berechnen Link-State-Protokolle den besten Weg?', options: ['Shortest Path First (SPF)', 'Hop-Count nach Bellman-Ford', 'Round Robin', 'Spanning Tree'], answer: 0, explain: 'Jeder Router kennt das ganze Netz und berechnet mit dem SPF-Algorithmus selbst die kürzesten Wege.' },
    { id: 'r12', type: 'mc', q: 'Ein Router kennt dasselbe Netz einmal als statische Route und einmal über OSPF. Welche Route nimmt er?', options: ['Die statische, weil ihre AD von 1 kleiner ist als 110', 'Die OSPF-Route, weil sie die bessere Metrik hat', 'Beide abwechselnd', 'Die, die er zuerst gelernt hat'], answer: 0, explain: 'Kommen die Routen aus verschiedenen Quellen, entscheidet die administrative Distanz, nicht die Metrik. Der kleinere Wert gewinnt.' },
    { id: 'r13', type: 'mc', q: 'Was gibt die <b>Metrik</b> an?', options: ['Die Kosten eines Weges innerhalb eines Routing-Protokolls', 'Wie sehr der Router einer Quelle vertraut', 'Die Anzahl der Interfaces', 'Das Alter der Route'], answer: 0, explain: 'Mit der Metrik vergleicht ein Protokoll seine eigenen Wege. Die administrative Distanz vergleicht verschiedene Quellen.' },
    { id: 'r14', type: 'multi', q: 'Welche Aussagen gelten für <b>statisches</b> Routing?', options: ['Es ist sicher, weil keine Routing-Informationen verbreitet werden', 'In großen Netzen ist der Aufwand hoch', 'Es passt sich automatisch an Ausfälle an', 'Es eignet sich gut für kleine Netze'], answer: [0, 1, 3], explain: 'Statische Routen reagieren nicht von selbst auf Ausfälle. Das ist ihr großer Nachteil.' },
    { id: 'r15', type: 'multi', q: 'Woraus setzt sich die Metrik von <b>EIGRP</b> laut Unterlagen zusammen?', options: ['Bandbreite', 'Verzögerung', 'Last', 'Zuverlässigkeit'], answer: [0, 1, 2, 3], explain: 'Die Unterlagen nennen alle vier Werte. In der Standardeinstellung rechnet EIGRP mit Bandbreite und Verzögerung.' },
    { id: 'r16', type: 'mc', q: 'Mit welchem Befehl zeigt man unter Windows die Routing-Tabelle an?', options: ['route print', 'ipconfig /routes', 'show ip route', 'tracert -r'], answer: 0, explain: 'route print oder netstat -r. show ip route ist der Befehl auf Cisco-Routern.' },
    { id: 'r17', type: 'mc', q: 'Was passiert beim Weiterleiten durch einen Router <b>nicht</b>?', options: ['Die Ziel-IP-Adresse wird geändert', 'Der Frame wird ausgepackt', 'Für die nächste Strecke wird ein neuer Frame gebaut', 'Die Ziel-MAC-Adresse ändert sich'], answer: 0, explain: 'Die IP-Adressen bleiben von Ende zu Ende gleich, solange kein NAT im Spiel ist. Die MAC-Adressen ändern sich dagegen auf jeder Teilstrecke.' },
    { id: 'r18', type: 'mc', q: 'Was bedeutet der Eintrag <span class="mono">S 10.10.10.16/29 [1/0] via 10.0.0.13</span>?', options: ['Statische Route mit AD 1 und Metrik 0, nächster Router ist 10.0.0.13', 'Subnetz 10.0.0.13 mit einem Host', 'OSPF-Route mit den Kosten 1', 'Direkt verbunden über Interface 1/0'], answer: 0, explain: 'In der eckigen Klammer stehen administrative Distanz und Metrik. Statische Routen haben die AD 1.' },
    { id: 'r19', type: 'tf', q: 'RIPv1 überträgt keine Subnetzmasken und unterstützt deshalb kein VLSM.', answer: true, explain: 'Erst RIPv2 überträgt Subnetzinformationen, nutzt Multicast und kann sich authentifizieren.' },
    { id: 'r20', type: 'mc', q: 'Welche Routen legt ein Cisco-Router für jedes eingerichtete Interface automatisch an?', options: ['Eine C-Route und eine L-Route', 'Nur eine S-Route', 'Eine Default-Route', 'Gar keine'], answer: 0, explain: 'C für das angeschlossene Netz und L für die eigene Adresse des Interfaces als /32.' },
    { id: 'r21', type: 'mc', q: 'Welche Art von Routing-Protokoll <b>konvergiert</b> in der Regel schneller, passt sich also schneller an Änderungen im Netz an?', options: ['Link State', 'Distance Vector', 'Statisches Routing', 'Beide gleich schnell'], answer: 0, explain: 'Bei Link State kennt jeder Router das ganze Netz und kann sofort selbst neu rechnen. Bei Distance Vector muss sich eine Änderung erst von Nachbar zu Nachbar herumsprechen.' },
    { id: 'r22', type: 'mc', q: 'Was ist der wichtigste Unterschied zwischen <b>Switching</b> und <b>Routing</b>?', options: ['Switching leitet innerhalb eines Netzes weiter (MAC), Routing zwischen Netzen (IP)', 'Switching nutzt IP-Adressen, Routing MAC-Adressen', 'Routing gibt es nur im WLAN', 'Es gibt keinen Unterschied'], answer: 0, explain: 'Der Switch arbeitet auf Schicht 2 mit MAC-Adressen im eigenen Netz. Der Router arbeitet auf Schicht 3 mit IP-Adressen zwischen verschiedenen Netzen.' },
    { id: 'r23', type: 'mc', q: 'Was ist das <b>Default-Gateway</b> eines PCs?', options: ['Der Router im eigenen Netz, an den alle Pakete für fremde Netze gehen', 'Der DNS-Server', 'Der Switch, an dem der PC hängt', 'Die Broadcastadresse des Netzes'], answer: 0, explain: 'Alles, was nicht im eigenen Netz liegt, schickt der PC an sein Default-Gateway. Der Router kümmert sich dann um den weiteren Weg.' },
    { id: 'r24', type: 'mc', q: 'Welche <b>administrative Distanz</b> hat OSPF bei Cisco?', options: ['110', '90', '120', '1'], answer: 0, explain: 'Direkt verbunden 0, statisch 1, EIGRP 90, OSPF 110, RIP 120.' },
    { id: 'r25', type: 'mc', q: 'Wie arbeiten <b>Distance-Vector</b>-Protokolle?', options: ['Jeder Router schickt regelmäßig seine Routing-Tabelle an seine direkten Nachbarn', 'Jeder Router kennt die gesamte Topologie und rechnet selbst den kürzesten Weg', 'Der Administrator trägt alle Routen von Hand ein', 'Ein zentraler Server berechnet alle Routen'], answer: 0, explain: 'Die Nachbarn übernehmen die Infos und addieren ihre eigenen Kosten. Die zweite Antwort beschreibt Link State.' },
  ],
  pairs: [
    { title: 'Code und Herkunft', items: [['C', 'direkt verbunden'], ['L', 'eigene IP des Interfaces'], ['S', 'statisch'], ['R', 'RIP'], ['O', 'OSPF'], ['D', 'EIGRP']] },
    { title: 'Administrative Distanz', items: [['direkt verbunden', '0'], ['statisch', '1'], ['EIGRP', '90'], ['OSPF', '110'], ['RIP', '120']] },
    { title: 'Protokoll und Merkmal', items: [['RIP', 'Hop-Count, höchstens 15'], ['OSPF', 'Link State mit Areas'], ['EIGRP', 'von Cisco, auch ungleiche Wege'], ['BGP', 'zwischen Providern'], ['Link State', 'SPF-Algorithmus'], ['Distance Vector', 'Tabelle an die Nachbarn']] },
  ],
  order: [
    { title: 'Sortiere die Schritte eines Routers beim Weiterleiten', items: ['Frame empfangen und auspacken', 'Ziel-IP mit der Routing-Tabelle vergleichen', 'Den besten Weg auswählen', 'Für die nächste Strecke neu einpacken', 'Weiterschicken'] },
  ],
};

export const natpat = {
  id: 'natpat', title: 'NAT und PAT', color: '#8A5A3C',
  blurb: 'Wie viele Geräte mit privaten Adressen über eine öffentliche IP-Adresse ins Internet kommen.',
  gens: ['pat', 'private'],
  learn: [
    {
      h: 'Warum es NAT gibt',
      html: `<p>Im Internet braucht jedes Gerät eine öffentliche IPv4-Adresse. Davon gibt es aber viel zu wenige. Deshalb nutzen Firmen und Haushalte intern <b>private Adressen</b>. Diese werden im Internet nicht weitergeleitet und dürfen in jedem lokalen Netz wiederverwendet werden.</p>
      <table><tr><th>Privater Bereich (RFC 1918)</th><th>Umfang</th></tr>
      <tr><td>10.0.0.0/8</td><td>10.0.0.0 bis 10.255.255.255</td></tr>
      <tr><td>172.16.0.0/12</td><td>172.16.0.0 bis 172.31.255.255</td></tr>
      <tr><td>192.168.0.0/16</td><td>192.168.0.0 bis 192.168.255.255</td></tr></table>
      <p>Damit ein Gerät mit privater Adresse trotzdem ins Internet kann, tauscht der Router am Übergang die private Adresse gegen eine öffentliche aus. Das ist <b>NAT</b> (Network Address Translation). Typischer Einsatzort ist der Router eines Netzes, das nur einen einzigen Ausgang ins Internet hat (ein sogenanntes Stub-Netz).</p>`,
    },
    {
      h: 'Die Begriffe',
      html: `<ul><li><b>Intern lokal</b> ist die private Adresse des PCs, zum Beispiel 192.168.10.10.</li>
      <li><b>Intern global</b> ist die öffentliche Adresse, unter der dieser PC im Internet erscheint.</li>
      <li><b>Extern global</b> ist die echte Adresse des Ziels im Internet, zum Beispiel eines Webservers.</li></ul>`,
    },
    {
      h: 'Statisches NAT, dynamisches NAT und PAT',
      html: `<p>Beim <b>statischen NAT</b> gehört eine private Adresse fest zu einer öffentlichen Adresse. Das braucht man für Server, die von außen immer unter derselben Adresse erreichbar sein müssen.</p>
      <p>Beim <b>dynamischen NAT</b> hat der Router einen Vorrat (Pool) an öffentlichen Adressen. Wer zuerst kommt, bekommt eine Adresse aus dem Pool. Dafür braucht aber jeder gleichzeitig aktive Client eine eigene öffentliche Adresse.</p>
      <p>Bei <b>PAT</b> (Port Address Translation, auch NAT-Overload) teilen sich viele Geräte eine einzige öffentliche Adresse. Der Router unterscheidet die Verbindungen anhand der <b>Portnummer</b>. So arbeiten fast alle Router zu Hause.</p>`,
    },
    {
      h: 'Die PAT-Regeln aus dem Unterricht',
      html: `<p>Wenn ein Router per PAT eine Verbindung übersetzt, wählt er den Quellport so:</p>
      <ol><li>Der ursprüngliche Quellport bleibt nach Möglichkeit erhalten. Es ändert sich nur die IP-Adresse.</li>
      <li>Ist der Port schon belegt, nimmt der Router den ersten freien Port aus derselben Portgruppe, von unten gezählt. Die Gruppen sind <b>0–511</b>, <b>512–1023</b> und <b>1024–65535</b>.</li>
      <li>Ist in der Gruppe kein Port mehr frei, nimmt der Router die nächste IP-Adresse aus dem NAT-Pool und wendet dort dieselben Regeln an.</li></ol>
      <div class="rechnung"><p>Beispiel: Ein PC sendet mit Quellport 80. Auf der öffentlichen Adresse sind die Ports 0, 1 und 80 schon belegt.</p><p>Port 80 ist belegt, also bleibt er nicht erhalten. Er gehört zur Gruppe 0–511. Die Ports 0 und 1 sind belegt, also bekommt die Verbindung den Port <b>2</b>.</p></div>
      <p>Nicht verwechseln: Die Portbereiche der IANA (0–1023, 1024–49151, 49152–65535) sind etwas anderes.</p>`,
    },
    {
      h: 'S-NAT, Masquerading und Portweiterleitung',
      html: `<p>Beim <b>Masquerading</b> (auch S-NAT) setzt der Router als Quelladresse seine eigene öffentliche IP-Adresse ein. Falls nötig, vergibt er eine neue Portnummer. In einer Tabelle merkt er sich, welche interne Adresse und welcher Port zu welchem externen Port gehören.</p>
      <div class="rechnung"><p>Beispiel aus dem Unterricht: PC1 192.168.0.1:5000 ruft den Server 170.0.0.1:80 auf. Der Router hat außen 205.0.0.2.</p><p>Im Internet sieht das Paket so aus: Quelle 205.0.0.2:6001, Ziel 170.0.0.1:80.<br>Der Router merkt sich: 192.168.0.1:5000 gehört zu Port 6001.</p><p>Die Antwort des Servers geht an 205.0.0.2:6001. Der Router schaut in seine Tabelle und schickt sie an 192.168.0.1:5000 weiter.</p></div>
      <p>NAT und PAT funktionieren nur für Verbindungen, die von innen aufgebaut werden. Soll ein interner Server von außen erreichbar sein, braucht man eine <b>Portweiterleitung</b> (D-NAT). Dabei leitet der Router zum Beispiel alles, was auf seinem Port 443 ankommt, an 192.168.1.20:443 weiter.</p>`,
    },
  ],
  questions: [
    { id: 'n1', type: 'mc', q: 'Wofür steht <b>PAT</b>?', options: ['Port Address Translation', 'Private Address Table', 'Public Access Tunnel', 'Packet Address Transfer'], answer: 0, explain: 'PAT heißt Port Address Translation. Man nennt es auch NAT-Overload.' },
    { id: 'n2', type: 'mc', q: 'Welche NAT-Variante verwenden die meisten <b>Router zu Hause</b>?', options: ['PAT (NAT-Overload)', 'Statisches NAT', 'Dynamisches NAT mit Pool', 'Gar kein NAT'], answer: 0, explain: 'Der Provider gibt eine öffentliche Adresse. Alle Geräte im Haushalt teilen sie sich, unterschieden über die Ports.' },
    { id: 'n3', type: 'mc', q: 'Welche NAT-Variante passt zu einem <b>Server</b>, der von außen immer unter derselben Adresse erreichbar sein muss?', options: ['Statisches NAT', 'Dynamisches NAT', 'PAT', 'Masquerading'], answer: 0, explain: 'Beim statischen NAT gehören private und öffentliche Adresse fest zusammen.' },
    { id: 'n4', type: 'mc', q: 'Was ist die <b>intern globale</b> Adresse?', options: ['Die öffentliche Adresse, unter der ein interner PC im Internet erscheint', 'Die private Adresse des PCs', 'Die Adresse des Webservers', 'Die Adresse des Gateways im LAN'], answer: 0, explain: 'Intern lokal ist die private Adresse, zum Beispiel 192.168.10.10. Intern global ist die öffentliche Adresse nach der Übersetzung.' },
    { id: 'n5', type: 'mc', q: 'Welcher Bereich ist <b>kein</b> privater Bereich nach RFC 1918?', options: ['172.32.0.0/16', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'], answer: 0, explain: 'Der private 172er-Bereich geht nur von 172.16.0.0 bis 172.31.255.255. 172.32 liegt schon außerhalb.' },
    { id: 'n6', type: 'mc', q: 'Woran unterscheidet PAT mehrere interne Geräte hinter einer öffentlichen Adresse?', options: ['An der Portnummer', 'An der MAC-Adresse', 'An der VLAN-ID', 'An der TTL'], answer: 0, explain: 'Jede Verbindung bekommt eine eindeutige Kombination aus öffentlicher Adresse und Port.' },
    { id: 'n7', type: 'mc', q: 'Ein PC sendet mit Quellport 5000. Auf der öffentlichen Adresse ist dieser Port noch frei. Welchen Port verwendet der Router bei PAT?', options: ['5000', '1024', '6001', '0'], answer: 0, explain: 'Nach der ersten PAT-Regel bleibt der Quellport erhalten, wenn er frei ist. Es ändert sich nur die IP-Adresse.' },
    { id: 'n8', type: 'mc', q: 'Port 80 ist belegt, die Ports 0 und 1 auch. Welchen Port vergibt der Router bei PAT?', options: ['2', '81', '1024', '512'], answer: 0, explain: 'Port 80 gehört zur Gruppe 0 bis 511. Der erste freie Port dieser Gruppe von unten ist 2.' },
    { id: 'n9', type: 'mc', q: 'Welche Portgruppen nennen die PAT-Regeln aus dem Unterricht?', options: ['0–511, 512–1023, 1024–65535', '0–1023, 1024–49151, 49152–65535', '0–255, 256–65535', '1–1024, 1025–65535'], answer: 0, explain: 'So steht es in den Unterlagen. Die zweite Antwort sind die Portbereiche der IANA, die sind etwas anderes.' },
    { id: 'n10', type: 'mc', q: 'Was passiert nach den PAT-Regeln, wenn in einer Portgruppe <b>kein Port mehr frei</b> ist?', options: ['Der Router nimmt die nächste IP-Adresse aus dem NAT-Pool', 'Das Paket wird verworfen', 'Der Router nimmt einen Port aus einer anderen Gruppe', 'Der PC bekommt eine neue private Adresse'], answer: 0, explain: 'Dann wird die nächste öffentliche Adresse aus dem Pool genommen, und dort gelten wieder dieselben Regeln.' },
    { id: 'n11', type: 'mc', q: 'Was macht der Router mit der <b>Antwort</b> eines Webservers auf eine PAT-Verbindung?', options: ['Er ersetzt Ziel-IP und Ziel-Port anhand seiner NAT-Tabelle durch die internen Werte', 'Er schickt sie an alle internen Geräte', 'Er verwirft sie', 'Er ändert nur die MAC-Adresse'], answer: 0, explain: 'Der Router hat sich gemerkt, welcher externe Port zu welcher internen Adresse gehört, und übersetzt zurück.' },
    { id: 'n12', type: 'mc', q: 'PC1 (192.168.0.1:5000) ruft 170.0.0.1:80 auf. Der Router hat außen 205.0.0.2 und vergibt den Port 6001. Wie lautet die <b>Quelle</b> des Pakets im Internet?', options: ['205.0.0.2:6001', '192.168.0.1:5000', '192.168.0.254:6001', '170.0.0.1:80'], answer: 0, explain: 'Der Router setzt seine öffentliche Adresse und den neuen Port ein. Er merkt sich, dass 6001 zu 192.168.0.1:5000 gehört.' },
    { id: 'n13', type: 'mc', q: 'Was ist eine <b>Portweiterleitung</b>?', options: ['Eingehende Verbindungen auf einen Port werden an ein internes Gerät weitergeleitet', 'Ausgehende Pakete bekommen einen neuen Port', 'Ein Switch-Port wird gespiegelt', 'Ein VLAN-Trunk'], answer: 0, explain: 'Zum Beispiel: Alles, was auf dem öffentlichen Port 443 ankommt, geht an den Server 192.168.1.20:443.' },
    { id: 'n14', type: 'tf', q: 'Bei dynamischem NAT ohne PAT braucht jedes gleichzeitig aktive Gerät eine eigene öffentliche Adresse aus dem Pool.', answer: true, explain: 'Genau deshalb ist PAT so verbreitet: Damit reicht eine öffentliche Adresse für viele Geräte.' },
    { id: 'n15', type: 'mc', q: 'Was ist ein <b>Stub-Netz</b>?', options: ['Ein Netz mit nur einem Ausgang ins Internet', 'Ein Netz ohne Internetzugang', 'Ein Netz mit nur einem Gerät', 'Ein VLAN ohne Trunk'], answer: 0, explain: 'Am Router eines solchen Netzes wird NAT typischerweise eingesetzt.' },
  ],
  pairs: [
    { title: 'NAT-Begriffe', items: [['Intern lokal', 'private Adresse des PCs'], ['Intern global', 'öffentliche Adresse des PCs nach NAT'], ['Extern global', 'echte Adresse des Ziels'], ['Statisches NAT', 'feste Zuordnung 1 zu 1'], ['Dynamisches NAT', 'Adresse aus einem Pool'], ['PAT', 'viele Geräte, eine Adresse, über Ports']] },
  ],
};

export const vpn = {
  id: 'vpn', title: 'VPN', color: '#1A9AA0',
  blurb: 'Verschlüsselte Verbindungen über das Internet: Arten, Protokolle und die beiden Betriebsmodi von IPsec.',
  gens: [],
  learn: [
    {
      h: 'Was ein VPN ist',
      html: `<p>Ein VPN (Virtual Private Network) baut einen verschlüsselten Tunnel durch ein öffentliches Netz, meistens das Internet. Für die Teilnehmer fühlt es sich so an, als säßen sie direkt im entfernten Netz, obwohl sie vielleicht tausende Kilometer entfernt sind.</p>
      <p>Ein VPN soll drei Dinge sicherstellen: <b>Vertraulichkeit</b> (niemand kann mitlesen), <b>Integrität</b> (niemand hat die Daten unterwegs verändert) und <b>Authentizität</b> (die Daten kommen wirklich vom angegebenen Absender).</p>
      <p>Die Idee dahinter: Statt eine teure eigene Leitung zu mieten, nutzt man den günstigen Internetzugang vor Ort und sichert die Verbindung durch Verschlüsselung ab.</p>
      <p>Typische Einsätze sind der Zugriff aufs Firmennetz aus dem Homeoffice oder von unterwegs und die Verbindung mehrerer Standorte. Der Teilnehmer meldet sich bei einem VPN-Server an. Nach dem Aufbau des Tunnels bekommt er eine neue, interne IP-Adresse.</p>`,
    },
    {
      h: 'Drei Arten von VPN',
      html: `<table><tr><th>Art</th><th>Was wird verbunden?</th><th>Beispiel</th></tr>
      <tr><td>End-to-Site</td><td>ein einzelnes Gerät mit einem Netz</td><td>Homeoffice ins Firmennetz</td></tr>
      <tr><td>Site-to-Site</td><td>zwei Netze miteinander</td><td>Filiale mit der Zentrale</td></tr>
      <tr><td>End-to-End</td><td>zwei einzelne Geräte direkt</td><td>Client direkt mit einem Server</td></tr></table>
      <p>In Prüfungen und Lernkarten tauchen für dieselben Arten oft andere Namen auf. Sie sind alle richtig:</p>
      <ul><li><b>End-to-Site</b> heißt auch Remote-Access-VPN, Host-to-LAN-VPN oder Host-to-Gateway-VPN.</li>
      <li><b>Site-to-Site</b> heißt auch LAN-to-LAN-VPN oder Gateway-to-Gateway-VPN.</li>
      <li><b>End-to-End</b> heißt auch Host-to-Host-VPN.</li></ul>
      <p>Bei Site-to-Site übernehmen zwei VPN-Gateways die Verschlüsselung. Die PCs in den Netzen brauchen dann keine eigene VPN-Software.</p>`,
    },
    {
      h: 'VPN-Protokolle',
      html: `<ul><li><b>IPsec</b> arbeitet auf OSI-Schicht 3. Mit ESP (Encapsulating Security Payload) sorgt es dafür, dass Pakete echt, unverändert und vertraulich sind.</li>
      <li><b>PPTP</b> ist veraltet und gilt als unsicher.</li>
      <li><b>L2TP</b> baut einen Tunnel, verschlüsselt aber selbst nicht. Deshalb kombiniert man es mit IPsec (L2TP over IPsec).</li>
      <li><b>SSL-VPN</b> nutzt die Verschlüsselung, die auch bei HTTPS zum Einsatz kommt.</li>
      <li><b>WireGuard</b> ist ein modernes VPN-Protokoll und zugleich die Software dazu.</li>
      <li><b>OpenVPN</b> ist eine Software, kein eigenes Protokoll.</li></ul>`,
    },
    {
      h: 'IPsec und Firewalls',
      html: `<p>Damit IPsec durch eine Firewall kommt, muss sie Folgendes durchlassen:</p>
      <ul><li><b>UDP-Port 500</b> für IKE, den Austausch der Schlüssel</li><li><b>IP-Protokoll 50</b> für ESP</li><li><b>IP-Protokoll 51</b> für AH, falls es genutzt wird</li></ul>
      <p>ESP und AH sind keine Ports, sondern eigene Protokolle neben TCP und UDP. Viele öffentliche WLANs und Hotelnetze lassen sie nicht durch. Dann klappt IPsec dort nicht.</p>
      <p>SSL-VPN läuft dagegen über normales TCP oder UDP wie anderer Datenverkehr. Es kommt deshalb auch durch eingeschränkte Netze.</p>`,
    },
    {
      h: 'Transportmodus und Tunnelmodus',
      html: `<p>IPsec kennt zwei Betriebsarten.</p>
      <p>Im <b>Transportmodus</b> bleibt der ursprüngliche IP-Header erhalten. Verschlüsselt werden nur die Nutzdaten. Absender und Empfänger sind also weiterhin sichtbar. Dafür ist der Aufwand geringer. Man nutzt ihn typischerweise, wenn sich ein einzelner Client mit einem Server verbindet.</p>
      <p>Im <b>Tunnelmodus</b> wird das gesamte Paket verschlüsselt und in ein neues IP-Paket eingepackt. Im Internet sind dann nur die Adressen der beiden VPN-Gateways zu sehen, die eigentliche Kommunikation bleibt verborgen. Man nutzt ihn vor allem, um zwei Netze über Gateways zu verbinden.</p>
      <table><tr><th>Tunnelmodus</th><th>Transportmodus</th></tr>
      <tr><td>ganzes Paket verschlüsselt</td><td>nur Nutzdaten verschlüsselt</td></tr>
      <tr><td>in neues IP-Paket eingepackt</td><td>ursprünglicher Header bleibt</td></tr>
      <tr><td>Quelle und Ziel verborgen</td><td>Quelle und Ziel sichtbar</td></tr>
      <tr><td>typisch zwischen Gateways</td><td>weniger Aufwand, typisch Client zu Server</td></tr></table>`,
    },
    {
      h: 'Sicherheit',
      html: `<p>IPsec und SSL gelten heute als sicher. Eine verbreitete Verschlüsselung ist AES mit 256-Bit-Schlüsseln. Das ergibt 2<sup>256</sup>, also etwa 1,1 · 10<sup>77</sup> mögliche Schlüssel.</p>
      <p>Angriffe mit gefälschten Zertifikaten funktionieren bei VPN nicht, weil Client und VPN-Gateway das falsche Zertifikat erkennen und keinen Tunnel aufbauen. Das größere Risiko sind laut Unterlagen gestohlene Notebooks oder VPN-Router.</p>
      <p>Zum Sicherheitskonzept gehört <b>AAA</b>:</p>
      <ul><li><b>Authentication</b>: Ist der Nutzer wirklich der, für den er sich ausgibt?</li><li><b>Authorization</b>: Darf er diesen Dienst nutzen?</li><li><b>Accounting</b>: Seine Nutzung wird festgehalten und dokumentiert.</li></ul>`,
    },
  ],
  questions: [
    { id: 'p1', type: 'mc', q: 'Welche VPN-Art verbindet zwei <b>Standorte</b> (Netze) miteinander?', options: ['Site-to-Site', 'End-to-Site', 'End-to-End', 'Client-to-Client'], answer: 0, explain: 'Bei Site-to-Site verbinden zwei VPN-Gateways die beiden Netze dauerhaft miteinander.' },
    { id: 'p2', type: 'mc', q: 'Welche VPN-Art passt zu einer Mitarbeiterin im <b>Homeoffice</b>, die ins Firmennetz will?', options: ['End-to-Site', 'Site-to-Site', 'End-to-End', 'Hub-and-Spoke'], answer: 0, explain: 'Ein einzelnes Gerät verbindet sich mit dem Netz der Firma. Das ist End-to-Site.' },
    { id: 'p3', type: 'mc', q: 'Auf welcher OSI-Schicht arbeitet <b>IPsec</b>?', options: ['Schicht 3', 'Schicht 2', 'Schicht 4', 'Schicht 7'], answer: 0, explain: 'IPsec schützt IP-Pakete direkt auf der Vermittlungsschicht.' },
    { id: 'p4', type: 'mc', q: 'Welchen Port nutzt IKE, der Schlüsselaustausch bei IPsec?', options: ['UDP 500', 'TCP 443', 'UDP 1194', 'TCP 22'], answer: 0, explain: 'IKE läuft über UDP-Port 500. ESP und AH sind dagegen eigene IP-Protokolle mit den Nummern 50 und 51.' },
    { id: 'p5', type: 'mc', q: 'Welche IP-Protokollnummer hat <b>ESP</b>?', options: ['50', '51', '500', '6'], answer: 0, explain: 'ESP hat die Nummer 50, AH die 51. Die 6 wäre TCP.' },
    { id: 'p6', type: 'mc', q: 'Was wird im <b>Transportmodus</b> verschlüsselt?', options: ['Nur die Nutzdaten', 'Das ganze Paket mit IP-Header', 'Nur der IP-Header', 'Gar nichts, es wird nur signiert'], answer: 0, explain: 'Der ursprüngliche IP-Header bleibt erhalten. Absender und Empfänger sind also weiterhin sichtbar.' },
    { id: 'p7', type: 'mc', q: 'Welcher Modus wird typischerweise zwischen zwei <b>VPN-Gateways</b> genutzt?', options: ['Tunnelmodus', 'Transportmodus', 'Monitormodus', 'Trunkmodus'], answer: 0, explain: 'Im Tunnelmodus wird das ganze Paket eingepackt. Die internen Adressen bleiben im Internet verborgen.' },
    { id: 'p8', type: 'multi', q: 'Welche Aussagen gelten für den <b>Tunnelmodus</b>?', options: ['Das ganze Paket wird verschlüsselt', 'Das Paket wird in ein neues IP-Paket eingepackt', 'Quelle und Ziel der eigentlichen Kommunikation sind nicht sichtbar', 'Er braucht weniger Verarbeitungszeit als der Transportmodus'], answer: [0, 1, 2], explain: 'Weniger Verarbeitungszeit ist ein Vorteil des Transportmodus, nicht des Tunnelmodus.' },
    { id: 'p9', type: 'mc', q: 'Was ist <b>OpenVPN</b> laut Unterlagen?', options: ['Eine Software, kein Protokoll', 'Ein Protokoll auf Schicht 2', 'Ein Hardware-Gateway', 'Ein Teil von IPsec'], answer: 0, explain: 'OpenVPN ist eine Software. WireGuard ist dagegen beides: Protokoll und Software.' },
    { id: 'p10', type: 'mc', q: 'Warum kommt <b>SSL-VPN</b> auch durch stark eingeschränkte Netze?', options: ['Es läuft über normales TCP oder UDP wie anderer Datenverkehr', 'Es verschlüsselt nicht', 'Es arbeitet auf Schicht 2', 'Es braucht keine IP-Adresse'], answer: 0, explain: 'IPsec braucht UDP 500 und die Protokolle 50 und 51, die oft gesperrt sind. SSL-VPN sieht für die Firewall aus wie normaler Verkehr.' },
    { id: 'p11', type: 'mc', q: 'Wofür steht das erste <b>A</b> in AAA?', options: ['Authentication: die Identität prüfen', 'Authorization: die Rechte prüfen', 'Accounting: die Nutzung festhalten', 'Access: den Zugang öffnen'], answer: 0, explain: 'AAA steht für Authentication, Authorization und Accounting.' },
    { id: 'p12', type: 'mc', q: 'Was bedeutet <b>Accounting</b> bei AAA?', options: ['Die Nutzung eines Dienstes festhalten und dokumentieren', 'Ein Benutzerkonto anlegen', 'Rechte vergeben', 'Das Passwort prüfen'], answer: 0, explain: 'Beim Accounting wird protokolliert, wer welchen Dienst wann und wie lange genutzt hat.' },
    { id: 'p13', type: 'mc', q: 'Welches VPN-Protokoll gilt als veraltet und unsicher?', options: ['PPTP', 'IPsec', 'WireGuard', 'SSL-VPN'], answer: 0, explain: 'PPTP hat bekannte Schwachstellen und sollte nicht mehr verwendet werden.' },
    { id: 'p14', type: 'tf', q: 'L2TP verschlüsselt selbst nicht und wird deshalb meistens zusammen mit IPsec eingesetzt.', answer: true, explain: 'Bei L2TP over IPsec baut L2TP den Tunnel, und IPsec übernimmt die Verschlüsselung.' },
    { id: 'p15', type: 'mc', q: 'Was ist laut Unterlagen das größere Sicherheitsrisiko bei VPN?', options: ['Gestohlene Notebooks oder VPN-Router', 'Angriffe mit gefälschten Zertifikaten', 'Zu kurze AES-Schlüssel', 'Zu viele gleichzeitige Tunnel'], answer: 0, explain: 'Gefälschte Zertifikate erkennen Client und Gateway, dann wird kein Tunnel aufgebaut. Gefährlicher ist es, wenn jemand ein Gerät mit gültigem Zugang in die Hände bekommt.' },
    { id: 'p16', type: 'multi', q: 'Was stellt <b>IPsec mit ESP</b> sicher?', options: ['Dass das Paket wirklich vom angegebenen Absender kommt', 'Dass das Paket unterwegs nicht verändert wurde', 'Dass niemand den Inhalt mitlesen kann', 'Eine höhere Bandbreite'], answer: [0, 1, 2], explain: 'ESP sorgt für Authentisierung, Integrität und Vertraulichkeit. Schneller wird die Verbindung dadurch nicht.' },
    { id: 'p17', type: 'mc', q: 'Wie nennt man ein <b>End-to-Site-VPN</b> auch?', options: ['Remote-Access-VPN', 'LAN-to-LAN-VPN', 'Gateway-to-Gateway-VPN', 'Host-to-Host-VPN'], answer: 0, explain: 'End-to-Site heißt auch Remote-Access-VPN oder Host-to-LAN-VPN. LAN-to-LAN und Gateway-to-Gateway sind andere Namen für Site-to-Site, Host-to-Host für End-to-End.' },
    { id: 'p18', type: 'mc', q: 'Wie nennt man ein <b>Site-to-Site-VPN</b> auch?', options: ['LAN-to-LAN-VPN', 'Remote-Access-VPN', 'Host-to-Host-VPN', 'Host-to-LAN-VPN'], answer: 0, explain: 'Site-to-Site verbindet zwei Netze, deshalb auch LAN-to-LAN oder Gateway-to-Gateway.' },
    { id: 'p19', type: 'multi', q: 'Welche drei Ziele soll ein VPN sicherstellen?', options: ['Vertraulichkeit', 'Integrität', 'Authentizität', 'Höhere Geschwindigkeit'], answer: [0, 1, 2], explain: 'Niemand soll mitlesen, niemand soll unbemerkt etwas verändern, und der Absender soll echt sein. Schneller wird die Verbindung durch ein VPN nicht.' },
  ],
  pairs: [
    { title: 'VPN-Art und Beispiel', items: [['End-to-Site', 'Homeoffice ins Firmennetz'], ['Site-to-Site', 'Filiale mit Zentrale'], ['End-to-End', 'Client direkt mit Server']] },
    { title: 'VPN-Art und anderer Name', items: [['End-to-Site', 'Remote-Access-VPN'], ['Site-to-Site', 'LAN-to-LAN-VPN'], ['End-to-End', 'Host-to-Host-VPN']] },
    { title: 'Begriffe', items: [['IKE', 'Schlüsselaustausch über UDP 500'], ['ESP', 'IP-Protokoll 50'], ['AH', 'IP-Protokoll 51'], ['Transportmodus', 'nur Nutzdaten verschlüsselt'], ['Tunnelmodus', 'ganzes Paket eingepackt'], ['AES-256', '2<sup>256</sup> mögliche Schlüssel']] },
    { title: 'AAA', items: [['Authentication', 'Identität prüfen'], ['Authorization', 'Darf der Nutzer den Dienst nutzen?'], ['Accounting', 'Nutzung festhalten']] },
  ],
};
