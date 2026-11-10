// Paketreisen (Schritt für Schritt) und Troubleshooting-Fälle
// sub: Zeilen der Gerätebeschriftung, getrennt durch " · " (wird als eigene Zeilen dargestellt)

const MAC = { pc1: 'AA:AA:AA:00:00:01', pcb: 'AA:AA:AA:00:00:22', r1: 'CC:CC:CC:00:00:FE', isp: 'DD:DD:DD:00:00:01', gwf: 'EE:EE:EE:00:00:02', gwz: 'EE:EE:EE:00:00:0A', srv: 'AA:AA:AA:00:01:10' };

export const journeys = [
  {
    id: 'internet', title: 'Ab ins Internet', topics: ['switch', 'vlan', 'routing', 'natpat'],
    desc: 'PC1 ruft eine Website auf. Du begleitest das Paket über Switch, Trunk und Router bis ins Internet und wieder zurück.',
    nodes: [
      { id: 'pc1', label: 'PC1', sub: '192.168.10.10/24 · VLAN 10', x: 60, y: 170, kind: 'pc' },
      { id: 'sw1', label: 'SW1', sub: 'Port 3: VLAN 10 · Port 24: Trunk', x: 250, y: 170, kind: 'switch' },
      { id: 'r1', label: 'R1', sub: 'innen 192.168.10.1 · außen 203.0.113.5', x: 440, y: 170, kind: 'router' },
      { id: 'inet', label: 'Internet', sub: '', x: 620, y: 170, kind: 'cloud' },
      { id: 'web', label: 'Webserver', sub: '93.184.216.34:443', x: 790, y: 170, kind: 'server' },
    ],
    links: [['pc1', 'sw1', 'Access'], ['sw1', 'r1', 'Trunk'], ['r1', 'inet', 'WAN'], ['inet', 'web', '']],
    steps: [
      {
        at: 'pc1', text: 'PC1 möchte eine Website auf <b>93.184.216.34</b> öffnen. Zuerst prüft PC1 mit seiner Subnetzmaske, wohin das Paket muss.',
        q: { q: 'Liegt 93.184.216.34 im Netz von PC1 (192.168.10.0/24)?', options: ['Nein, also geht das Paket an das Default-Gateway', 'Ja, also wird es direkt zugestellt', 'Nein, also wird das Paket verworfen', 'Ja, also wird es per Broadcast verschickt'], answer: 0, explain: 'Der Netzanteil von PC1 ist 192.168.10, der des Ziels 93.184.216. Das Ziel liegt also in einem anderen Netz. Deshalb geht das Paket an das Default-Gateway 192.168.10.1.' },
      },
      {
        at: 'pc1', text: 'Um den Frame zu bauen, braucht PC1 die <b>MAC-Adresse des Gateways</b>. Die kennt PC1 aber noch nicht.',
        q: { q: 'Wie findet PC1 die MAC-Adresse von 192.168.10.1 heraus?', options: ['Mit einer ARP-Anfrage als Broadcast: „Wer hat 192.168.10.1?“', 'Mit einer DNS-Anfrage', 'Es nimmt die MAC-Adresse des Webservers', 'Mit einer DHCP-Anfrage'], answer: 0, explain: 'ARP findet zu einer IP-Adresse die passende MAC-Adresse. Die Anfrage geht als Broadcast an alle, und der Router antwortet direkt an PC1.' },
      },
      {
        at: ['pc1', 'sw1'], packet: { smac: MAC.pc1, dmac: '?', sip: '192.168.10.10', dip: '93.184.216.34', sport: '50123', dport: '443' }, text: 'PC1 baut den Frame und schickt ihn an den Switch.',
        q: { q: 'Welche <b>Ziel-MAC-Adresse</b> steht im Frame?', options: [`${MAC.r1}, die MAC von R1`, 'Die MAC-Adresse des Webservers', 'FF:FF:FF:FF:FF:FF', 'Die MAC-Adresse von SW1'], answer: 0, explain: 'Die Ziel-IP ist der Webserver, aber die Ziel-MAC ist die des nächsten Geräts auf dem Weg, also des Routers. Der Switch taucht als Adresse im Frame gar nicht auf.' },
        reveal: { dmac: MAC.r1 },
      },
      {
        at: 'sw1', text: 'Der Frame kommt an <b>Port 3</b> des Switches an.',
        q: { q: 'Was trägt SW1 in seine Source Address Table ein?', options: ['Die MAC-Adresse von PC1 an Port 3', 'Die MAC-Adresse von R1 an Port 3', 'Die IP-Adresse 192.168.10.10 an Port 3', 'Nichts, Switche lernen nicht'], answer: 0, explain: 'Der Switch lernt immer vom Absender: Die Quell-MAC von PC1 sitzt hinter Port 3. Die MAC von R1 kennt er bereits von Port 24.' },
      },
      {
        at: ['sw1', 'r1'], text: 'Die Verbindung zum Router ist ein <b>Trunk</b>. Darüber laufen mehrere VLANs gemeinsam.',
        q: { q: 'Was passiert mit dem Frame auf dem Trunk?', options: ['Er bekommt einen VLAN-Tag mit der ID 10, direkt nach den MAC-Adressen', 'Er wird verschlüsselt', 'Die Ziel-IP wird auf VLAN 10 gesetzt', 'Nichts, VLANs gibt es nur innerhalb des Switches'], answer: 0, explain: 'Auf einem Trunk bekommt jeder Frame einen Tag nach 802.1Q. So weiß der Router, dass der Frame aus VLAN 10 kommt.' },
        reveal: { vlan: '10' },
      },
      {
        at: 'r1', table: 'C  192.168.10.0/24  Gi0/0.10\nC  192.168.20.0/24  Gi0/0.20\nC  203.0.113.4/30   Gi0/1\nS* 0.0.0.0/0 [1/0] via 203.0.113.6',
        text: 'Der Router packt das Paket aus und schaut in seine Routing-Tabelle.',
        q: { q: 'Welcher Eintrag passt zur Ziel-IP 93.184.216.34?', options: ['S* 0.0.0.0/0 via 203.0.113.6, die Default-Route', 'C 192.168.10.0/24', 'C 203.0.113.4/30', 'Keiner, das Paket wird verworfen'], answer: 0, explain: 'Keines der direkt verbundenen Netze passt. Deshalb greift die Default-Route. Das Sternchen markiert sie.' },
      },
      {
        at: 'r1', text: 'Mit seiner privaten Absenderadresse käme das Paket im Internet nicht weit. Der Router macht deshalb <b>PAT</b> mit seiner öffentlichen Adresse 203.0.113.5. Der Port 50123 ist dort noch frei.',
        q: { q: 'Wie lautet die neue Absenderangabe des Pakets?', options: ['203.0.113.5:50123', '192.168.10.10:50123', '203.0.113.5:1024', '203.0.113.6:443'], answer: 0, explain: 'Die private Adresse wird durch die öffentliche ersetzt. Weil der Port 50123 frei ist, bleibt er nach der PAT-Regel erhalten. Der Router merkt sich, dass Port 50123 zu 192.168.10.10 gehört.' },
        reveal: { sip: '203.0.113.5', vlan: '–' },
      },
      {
        at: ['r1', 'inet'], text: 'Für die Strecke ins Internet baut der Router einen neuen Frame.',
        q: { q: 'Was ändert sich auf dieser Strecke <b>außerdem</b>?', options: ['Quell- und Ziel-MAC werden neu gesetzt, die Ziel-IP bleibt', 'Die Ziel-IP wird zur Adresse des Providers', 'Nichts außer der Quell-IP', 'Der VLAN-Tag 10 bleibt erhalten'], answer: 0, explain: 'MAC-Adressen gelten nur für eine Teilstrecke. Jetzt ist der Router der Absender und der nächste Router beim Provider das Ziel. Der VLAN-Tag gehört nur ins eigene LAN.' },
        reveal: { smac: MAC.r1.replace('FE', 'F1'), dmac: MAC.isp },
      },
      {
        at: 'web', text: 'Der Webserver antwortet an <b>203.0.113.5:50123</b>. PC1 selbst bekommt er nie zu sehen.',
        packet: { smac: '…', dmac: '…', sip: '93.184.216.34', dip: '203.0.113.5', sport: '443', dport: '50123', vlan: '–' },
      },
      {
        at: 'r1', text: 'Die Antwort kommt beim Router an.',
        q: { q: 'Woher weiß der Router, an wen die Antwort gehört?', options: ['Aus seiner NAT-Tabelle: Port 50123 gehört zu 192.168.10.10:50123', 'Er schickt sie an alle Geräte im LAN', 'Aus der ARP-Tabelle', 'Allein aus der Routing-Tabelle'], answer: 0, explain: 'Der Router übersetzt zurück: Aus 203.0.113.5:50123 wird wieder 192.168.10.10:50123. Danach bekommt der Frame auf dem Trunk wieder den Tag VLAN 10, und der Switch liefert ihn an Port 3.' },
        reveal: { dip: '192.168.10.10', dmac: MAC.pc1, smac: MAC.r1, vlan: '10' },
      },
      { at: 'pc1', text: '<b>Geschafft.</b> PC1 hat die Antwort. Das Wichtigste aus dieser Reise: Die IP-Adressen bleiben von Ende zu Ende gleich, nur NAT ändert sie. Die MAC-Adressen wechseln auf jeder Teilstrecke. Und VLAN-Tags gibt es nur auf Trunks.' },
    ],
  },
  {
    id: 'intervlan', title: 'Von VLAN 10 nach VLAN 20', topics: ['vlan', 'switch', 'routing', 'subnetting'],
    desc: 'Zwei PCs hängen am selben Switch, aber in verschiedenen VLANs. Wie kommt das Paket trotzdem an?',
    nodes: [
      { id: 'pca', label: 'PC-A', sub: '192.168.10.20/24 · VLAN 10', x: 80, y: 90, kind: 'pc' },
      { id: 'pcb', label: 'PC-B', sub: '192.168.20.30/24 · VLAN 20', x: 80, y: 260, kind: 'pc' },
      { id: 'sw', label: 'SW1', sub: 'Port 1: VLAN 10 · Port 2: VLAN 20 · Port 24: Trunk', x: 340, y: 175, kind: 'switch' },
      { id: 'r', label: 'R1', sub: 'Gi0/0.10 = 192.168.10.1 · Gi0/0.20 = 192.168.20.1', x: 620, y: 175, kind: 'router' },
    ],
    links: [['pca', 'sw', 'VLAN 10'], ['pcb', 'sw', 'VLAN 20'], ['sw', 'r', 'Trunk']],
    steps: [
      {
        at: 'pca', text: 'PC-A und PC-B hängen am <b>selben Switch</b>. PC-A schickt einen Ping an PC-B.',
        q: { q: 'Kann der Switch den Frame direkt von Port 1 an Port 2 schicken?', options: ['Nein, verschiedene VLANs sind getrennte Netze', 'Ja, es ist derselbe Switch', 'Ja, wenn er die MAC-Adresse kennt', 'Nur per Broadcast'], answer: 0, explain: 'VLAN 10 und VLAN 20 verhalten sich wie zwei getrennte Switche. Außerdem liegen sie in verschiedenen Subnetzen.' },
      },
      {
        at: ['pca', 'sw'], packet: { smac: MAC.pc1, dmac: MAC.r1, sip: '192.168.10.20', dip: '192.168.20.30', sport: 'ICMP', dport: 'ICMP' }, text: 'PC-A stellt fest: 192.168.20.30 liegt nicht im Netz 192.168.10.0/24.',
        q: { q: 'An welche Ziel-MAC-Adresse schickt PC-A den Frame?', options: ['An die MAC von R1, dem Default-Gateway 192.168.10.1', 'An die MAC von PC-B', 'An FF:FF:FF:FF:FF:FF', 'An die MAC von SW1'], answer: 0, explain: 'Das Ziel liegt in einem anderen Netz. Deshalb geht der Frame an das Default-Gateway.' },
      },
      {
        at: ['sw', 'r'], text: 'Ein Kabel, zwei VLANs: der Trunk zum Router.',
        q: { q: 'Mit welcher VLAN-ID kommt der Frame beim Router an?', options: ['10', '20', 'ohne ID', '1'], answer: 0, explain: 'Der Frame stammt aus VLAN 10. Der Router ordnet ihn deshalb seinem Subinterface Gi0/0.10 zu.' },
        reveal: { vlan: '10' },
      },
      {
        at: 'r', table: 'C  192.168.10.0/24  Gi0/0.10\nL  192.168.10.1/32  Gi0/0.10\nC  192.168.20.0/24  Gi0/0.20\nL  192.168.20.1/32  Gi0/0.20',
        text: 'Der Router hat für jedes VLAN ein eigenes <b>Subinterface</b> mit eigener IP-Adresse.',
        q: { q: 'Über welches Interface schickt der Router das Paket weiter?', options: ['Über Gi0/0.20, das direkt mit 192.168.20.0/24 verbunden ist', 'Über Gi0/0.10', 'Über die Default-Route', 'Gar nicht'], answer: 0, explain: 'Die Ziel-IP liegt im direkt verbundenen Netz 192.168.20.0/24, und das hängt an Gi0/0.20.' },
      },
      {
        at: ['r', 'sw'], text: 'Der Router baut einen neuen Frame und schickt ihn über denselben Trunk zurück.',
        q: { q: 'Welcher VLAN-Tag steht jetzt im Frame?', options: ['20', '10', 'keiner', '10 und 20'], answer: 0, explain: 'Es ist dasselbe Kabel, aber jetzt geht der Frame ins VLAN 20. Weil der Router nur mit einem Kabel am Switch hängt, nennt man diesen Aufbau „Router-on-a-Stick“.' },
        reveal: { vlan: '20', smac: MAC.r1, dmac: MAC.pcb },
      },
      {
        at: 'sw', text: 'Angenommen, der Switch kennt die MAC-Adresse von PC-B noch nicht.',
        q: { q: 'An welche Ports schickt der Switch den Frame dann?', options: ['Nur an die Ports in VLAN 20, außer dem Eingangsport', 'An alle Ports des Switches', 'Nur an Port 24', 'An keinen, er verwirft ihn'], answer: 0, explain: 'Auch das Fluten bleibt innerhalb des VLANs. Jedes VLAN ist eine eigene Broadcast-Domäne.' },
      },
      { at: 'pcb', text: '<b>Angekommen.</b> Am Access-Port entfernt der Switch den Tag, PC-B sieht einen ganz normalen Frame. Ohne Router oder Layer-3-Switch gäbe es keine Verbindung zwischen den beiden VLANs.', reveal: { vlan: '–' } },
    ],
  },
  {
    id: 'vpn', title: 'Filiale über VPN', topics: ['vpn', 'routing', 'natpat'],
    desc: 'Ein PC in der Filiale greift auf einen Server in der Zentrale zu. Was sieht man davon im Internet?',
    nodes: [
      { id: 'pcf', label: 'PC Filiale', sub: '10.2.0.15/24', x: 60, y: 170, kind: 'pc' },
      { id: 'gwf', label: 'VPN-Gateway Filiale', sub: 'LAN 10.2.0.1 · WAN 198.51.100.2', x: 250, y: 170, kind: 'router' },
      { id: 'inet', label: 'Internet', sub: '', x: 450, y: 170, kind: 'cloud' },
      { id: 'gwz', label: 'VPN-Gateway Zentrale', sub: 'WAN 203.0.113.10 · LAN 10.1.0.1', x: 650, y: 170, kind: 'router' },
      { id: 'srv', label: 'Dateiserver', sub: '10.1.0.10/24', x: 830, y: 170, kind: 'server' },
    ],
    links: [['pcf', 'gwf', 'LAN'], ['gwf', 'inet', 'Tunnel'], ['inet', 'gwz', 'Tunnel'], ['gwz', 'srv', 'LAN']],
    steps: [
      {
        at: 'pcf', text: 'Filiale und Zentrale sind dauerhaft über die beiden VPN-Gateways verbunden.',
        q: { q: 'Welche VPN-Art ist das?', options: ['Site-to-Site', 'End-to-Site', 'End-to-End', 'Hub-and-Spoke'], answer: 0, explain: 'Hier werden zwei Netze über zwei Gateways verbunden. Die PCs selbst brauchen keine VPN-Software.' },
      },
      {
        at: ['pcf', 'gwf'], packet: { smac: MAC.pc1, dmac: MAC.gwf, sip: '10.2.0.15', dip: '10.1.0.10', sport: '50500', dport: '445' }, text: 'Der PC schickt ein ganz normales Paket an sein Gateway.',
      },
      {
        at: 'gwf', text: 'Das Gateway sichert die Verbindung mit IPsec im <b>Tunnelmodus</b>.',
        q: { q: 'Was passiert mit dem ursprünglichen Paket?', options: ['Es wird komplett verschlüsselt und in ein neues IP-Paket eingepackt', 'Nur die Nutzdaten werden verschlüsselt, der Header bleibt', 'Es wird per NAT umgeschrieben', 'Es bekommt einen VLAN-Tag'], answer: 0, explain: 'Im Tunnelmodus entsteht ein neues, äußeres Paket von Gateway zu Gateway. Das innere Paket ist darin verschlüsselt und nicht zu sehen.' },
      },
      {
        at: ['gwf', 'inet'], packet: { smac: '…', dmac: '…', sip: '198.51.100.2', dip: '203.0.113.10', sport: 'ESP', dport: 'ESP' }, text: 'Im Internet ist jetzt nur noch das <b>äußere</b> Paket zu sehen.',
        q: { q: 'Welche Adressen kann jemand im Internet mitlesen?', options: ['Nur die Adressen der Gateways: 198.51.100.2 und 203.0.113.10', 'Die internen Adressen 10.2.0.15 und 10.1.0.10', 'Alle vier Adressen', 'Gar keine'], answer: 0, explain: 'Wer im Internet mitliest, sieht nur, dass die beiden Gateways miteinander reden. Welcher PC mit welchem Server spricht, bleibt verborgen.' },
      },
      {
        at: 'inet', text: 'Auf dem Weg liegt die Firewall der Zentrale.',
        q: { q: 'Was muss die Firewall für IPsec durchlassen?', options: ['UDP-Port 500 für IKE und das IP-Protokoll 50 für ESP', 'Nur TCP-Port 443', 'Nur ICMP', 'TCP-Port 22 und UDP-Port 53'], answer: 0, explain: 'Der Schlüsselaustausch IKE läuft über UDP 500, die verschlüsselten Daten über ESP (Protokoll 50). Falls AH genutzt wird, kommt Protokoll 51 dazu.' },
      },
      {
        at: 'gwz', text: 'Das Gateway der Zentrale prüft, ob das Paket echt und unverändert ist. Dann entschlüsselt es das Paket und packt das ursprüngliche Paket aus.',
        q: { q: 'Welche Ziel-IP hat das ausgepackte Paket?', options: ['10.1.0.10', '203.0.113.10', '10.1.0.1', '198.51.100.2'], answer: 0, explain: 'Das innere Paket ist unverändert geblieben. Es wird jetzt im LAN der Zentrale ganz normal zugestellt.' },
        reveal: { sip: '10.2.0.15', dip: '10.1.0.10', sport: '50500', dport: '445', smac: MAC.gwz, dmac: MAC.srv },
      },
      { at: 'srv', text: '<b>Angekommen.</b> Für den Server sieht es aus, als stünde der PC im eigenen LAN. Zum Vergleich: Im Transportmodus würden nur die Nutzdaten verschlüsselt. Das spart Aufwand, aber Absender und Empfänger wären im Internet sichtbar.' },
    ],
  },
];

export const cases = [
  {
    id: 'c1', title: 'Drucker geht, Internet nicht', topic: 'routing',
    situation: 'Ein PC erreicht den Drucker im eigenen Netz, aber keine Website. Auch <span class="mono">ping 8.8.8.8</span> schlägt fehl. So sieht die Ausgabe von <span class="mono">ipconfig</span> aus:',
    pre: 'IPv4-Adresse . . . : 192.168.1.50\nSubnetzmaske . . . : 255.255.255.0\nStandardgateway . . :\nDNS-Server . . . . : 192.168.1.1',
    q: 'Was ist die wahrscheinlichste Ursache?', options: ['Es ist kein Standardgateway eingetragen', 'Die Subnetzmaske ist falsch', 'Der DNS-Server fehlt', 'Das Kabel ist defekt'], answer: 0,
    explain: 'Ohne Gateway weiß der PC nicht, wohin er Pakete für andere Netze schicken soll. Am DNS liegt es nicht, denn schon der Ping auf eine IP-Adresse klappt nicht. Und das Kabel ist in Ordnung, denn der Drucker funktioniert.',
  },
  {
    id: 'c2', title: 'Gleicher Switch, trotzdem kein Ping', topic: 'vlan',
    situation: 'PC1 und PC2 stecken am selben managed Switch und haben Adressen aus demselben Subnetz. Trotzdem erreichen sie sich nicht. Die Port-Konfiguration:',
    pre: 'Port 1  PC1  VLAN 10, untagged\nPort 2  PC2  VLAN 20, untagged',
    q: 'Was ist das Problem?', options: ['Die beiden Ports liegen in verschiedenen VLANs', 'Der Switch braucht ein Crossover-Kabel', 'Die MAC-Tabelle ist voll', 'Der Switch kann kein ICMP'], answer: 0,
    explain: 'Verschiedene VLANs sind getrennte Netze, auch wenn sie auf demselben Gerät liegen. Port 2 muss ins VLAN 10. Alternativ bräuchte man einen Router zwischen den VLANs.',
  },
  {
    id: 'c3', title: 'Der Drucker antwortet nicht', topic: 'subnetting',
    situation: 'PC und Drucker hängen am selben Switch, VLANs gibt es nicht. Der PC erreicht den Drucker trotzdem nicht.',
    pre: 'PC:      192.168.1.130  255.255.255.128\nDrucker: 192.168.1.20   255.255.255.128',
    q: 'Woran liegt es?', options: ['Die Geräte liegen in verschiedenen Subnetzen', 'Der Drucker braucht ein Gateway', 'Die Maske muss 255.255.0.0 sein', 'Die Adressen sind privat'], answer: 0,
    explain: 'Die Maske /25 teilt das Netz bei 128 in zwei Hälften: 192.168.1.0 bis 127 und 192.168.1.128 bis 255. PC und Drucker liegen in verschiedenen Hälften. Der PC schickt die Pakete deshalb an sein Gateway statt direkt zum Drucker. Lösung: beide Geräte in dieselbe Hälfte setzen oder die Maske /24 verwenden.',
  },
  {
    id: 'c4', title: 'Nur VLAN 1 kommt durch', topic: 'vlan',
    situation: 'Zwei Switche sind mit einem Kabel verbunden. Zwischen ihnen funktioniert nur VLAN 1. VLAN 10 und VLAN 20 kommen nicht an.',
    pre: 'SW1 Port 24: Access, VLAN 1\nSW2 Port 24: Access, VLAN 1',
    q: 'Was muss man ändern?', options: ['Port 24 auf beiden Seiten als Trunk einrichten, mit VLAN 10 und 20 tagged', 'Ein Crossover-Kabel verwenden', 'VLAN 1 auf beiden Switchen löschen', 'Ein zweites Kabel nur für VLAN 1 ziehen'], answer: 0,
    explain: 'Ein Access-Port überträgt genau ein VLAN. Damit mehrere VLANs über ein Kabel laufen, braucht man einen Trunk mit VLAN-Tags nach 802.1Q.',
  },
  {
    id: 'c5', title: 'Langsam und voller Fehler', topic: 'kabel',
    situation: 'Ein Büro-PC verliert ständig die Verbindung. Der Link läuft nur mit 100 Mbit/s, und die Fehlerzähler steigen. Laut Messprotokoll ist das Cat6-Kabel vom Switch bis zum PC 128 m lang.',
    q: 'Was ist die Ursache?', options: ['Die Strecke ist länger als 100 m, die Dämpfung ist zu hoch', 'Cat6 schafft kein Gigabit', 'Es fehlt ein Crossover-Kabel', 'Das VLAN ist falsch'], answer: 0,
    explain: 'Twisted Pair darf von aktivem zu aktivem Gerät höchstens 100 m lang sein. Lösung: einen Switch näher an den Arbeitsplatz bringen oder die lange Strecke mit Glasfaser überbrücken.',
  },
  {
    id: 'c6', title: 'Server von außen nicht erreichbar', topic: 'natpat',
    situation: 'Ein interner Webserver (192.168.1.20, Port 443) soll aus dem Internet über die öffentliche Adresse des Routers erreichbar sein. Im lokalen Netz funktioniert er. Der Router macht PAT für alle Geräte.',
    q: 'Was fehlt?', options: ['Eine Portweiterleitung oder statisches NAT für Port 443 auf 192.168.1.20', 'Eine Default-Route auf dem Server', 'Ein eigenes VLAN für den Server', 'Eine größere Subnetzmaske'], answer: 0,
    explain: 'PAT übersetzt nur Verbindungen, die von innen aufgebaut werden. Für Verbindungen von außen braucht der Router eine feste Regel, an welches interne Gerät er sie weitergeben soll.',
  },
  {
    id: 'c7', title: 'VPN im Hotel', topic: 'vpn',
    situation: 'Eine Mitarbeiterin bekommt im Hotel-WLAN keine Verbindung mit dem IPsec-VPN. Zu Hause klappt es. Mit dem SSL-VPN der Firma funktioniert es auch im Hotel.',
    q: 'Was ist die wahrscheinlichste Ursache?', options: ['Das Hotelnetz sperrt UDP 500 oder das Protokoll ESP (50)', 'Ihr Zertifikat ist abgelaufen', 'Der AES-Schlüssel ist zu kurz', 'Das Hotel nutzt CSMA/CA'], answer: 0,
    explain: 'IPsec braucht UDP-Port 500 und das Protokoll 50, und viele öffentliche Netze lassen das nicht durch. SSL-VPN läuft dagegen über normales TCP oder UDP und kommt deshalb durch.',
  },
  {
    id: 'c8', title: 'Statische Route ins Leere', topic: 'routing',
    situation: 'Das Netz 10.20.0.0/24 hinter R2 ist von R1 aus nicht erreichbar. R1 und R2 sind über das Netz 10.0.0.0/30 verbunden. R1 hat die .1, R2 die .2.',
    pre: 'R1# show ip route\nC  10.0.0.0/30 is directly connected, Gi0/1\nL  10.0.0.1/32 is directly connected, Gi0/1\nS  10.20.0.0/24 [1/0] via 10.0.0.3',
    q: 'Wo liegt der Fehler?', options: ['Der Next Hop 10.0.0.3 ist die Broadcastadresse, richtig wäre 10.0.0.2', 'Die Maske /24 müsste /30 sein', 'Statische Routen brauchen die AD 120', 'R1 braucht eine L-Route für 10.20.0.0'], answer: 0,
    explain: 'Im Netz 10.0.0.0/30 gibt es nur zwei Hosts: .1 und .2. Die .3 ist die Broadcastadresse. Als nächster Router muss R2 eingetragen sein: <span class="mono">ip route 10.20.0.0 255.255.255.0 10.0.0.2</span>.',
  },
  {
    id: 'c9', title: 'Server extrem langsam', topic: 'kabel',
    situation: 'Die Verbindung zwischen Server und Switch ist extrem langsam. Am Server sind 100 Mbit/s Vollduplex fest eingestellt. Der Switch-Port steht auf Automatisch und hat 100 Mbit/s Halbduplex ausgehandelt. Der Switch meldet viele späte Kollisionen.',
    q: 'Was ist das Problem?', options: ['Die beiden Seiten nutzen unterschiedliche Duplex-Modi', 'Das Kabel ist zu kurz', 'Der Server braucht CSMA/CA', 'Die VLAN-ID ist zu groß'], answer: 0,
    explain: 'Beide Seiten einer Verbindung müssen denselben Duplex-Modus haben. Lösung: beide auf Automatisch stellen oder beide fest auf Vollduplex.',
  },
  {
    id: 'c10', title: 'Jeder sieht alles', topic: 'switch',
    situation: 'Ein Kollege ersetzt den Switch im Labor durch ein altes Gerät aus dem Keller. Danach sieht jeder PC in Wireshark den gesamten Datenverkehr aller anderen PCs, und das Netz wird langsamer.',
    q: 'Was wurde wahrscheinlich eingebaut?', options: ['Ein Hub', 'Ein Layer-3-Switch', 'Ein Router', 'Ein VPN-Gateway'], answer: 0,
    explain: 'Ein Hub schickt jeden Frame an alle Ports. Ein Switch würde nach kurzer Zeit nur noch gezielt an den richtigen Port senden.',
  },
  {
    id: 'c11', title: 'Die Adressen reichen nicht', topic: 'subnetting',
    situation: 'Eine Abteilung mit 40 PCs, 2 Druckern und einem Gateway bekommt das Netz 172.16.5.0/27. Ab dem 31. Gerät gibt es keine freie Adresse mehr.',
    q: 'Welches Präfix ist das kleinste Netz, das ausreicht?', options: ['/26 mit 62 Hosts', '/28 mit 14 Hosts', '/27 reicht, der DHCP-Server ist falsch eingestellt', '/24 ist vorgeschrieben'], answer: 0,
    explain: 'Gebraucht werden 43 Adressen. Ein /27 hat nur 30 nutzbare Hosts, ein /26 hat 62. Das reicht.',
  },
  {
    id: 'c12', title: 'Glasfaser bleibt dunkel', topic: 'kabel',
    situation: 'Eine neu gesteckte Glasfaserstrecke im Rechenzentrum bekommt keinen Link. Am Switch steckt ein Multimode-Modul (SFP), das Patchkabel ist gelb.',
    q: 'Was fällt auf?', options: ['Gelb steht für Singlemode, Faser und Modul passen nicht zusammen', 'Glasfaser braucht ein Crossover-Kabel', 'Das Kabel ist zu kurz', 'Gelb ist die Farbe für Cat7'], answer: 0,
    explain: 'Singlemode ist meist gelb, Multimode orange oder türkis. Faser, Stecker und Modul müssen zueinander passen. Danach sollte man auch prüfen, ob Sende- und Empfangsfaser vertauscht sind.',
  },
];
