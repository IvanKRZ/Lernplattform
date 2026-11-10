// Netzwerktechnik – Teil 2: Kabel & Übertragungstechnik, Topologien, Switch, VLAN

export const kabel = {
  id: 'kabel', title: 'Kabel und Übertragung', color: '#8A5A3C',
  blurb: 'Kupfer und Glasfaser, strukturierte Verkabelung, Störungen und wie sich Geräte das Medium teilen.',
  gens: ['lwl'],
  learn: [
    {
      h: 'Strukturierte Verkabelung',
      html: `<p>Ein Firmennetz wird nicht wild verkabelt, sondern nach einem festen Schema in drei Bereichen. Das macht die Planung einfacher und hilft später bei der Fehlersuche.</p>
      <table><tr><th>Bereich</th><th>Wo?</th><th>Medium</th></tr>
      <tr><td>Primärverkabelung</td><td>Gelände: zwischen Gebäuden</td><td>Glasfaser</td></tr>
      <tr><td>Sekundärverkabelung</td><td>Gebäude: senkrecht zwischen den Etagenverteilern</td><td>laut DIN Glasfaser, in der Praxis auch Kupfer</td></tr>
      <tr><td>Tertiärverkabelung</td><td>Etage: waagerecht bis zu den Arbeitsplätzen</td><td>meist Kupfer</td></tr></table>
      <p>Zwischen Gebäuden nimmt man Glasfaser, weil sie weite Strecken schafft und keinen Strom leitet. Man spricht von <b>galvanischer Trennung</b>. Dadurch fließen keine Ausgleichsströme zwischen den Gebäuden, und ein Blitzeinschlag wird nicht über das Netzwerkkabel weitergeleitet.</p>
      <p>Den größten Teil deiner Arbeit als Fachinformatiker wirst du in der Tertiärverkabelung haben.</p>`,
    },
    {
      h: 'Twisted-Pair-Kabel',
      html: `<p>Das typische Netzwerkkabel ist ein Twisted-Pair-Kabel. Es hat 8 Adern, die paarweise miteinander verdrillt sind. Die Verdrillung verringert Störungen. Am Ende sitzt ein <b>RJ45-Stecker</b> (Registered Jack, mechanisch korrekt 8P8C). Ab Cat7 nennen die Unterlagen den GG45-Stecker.</p>
      <p>Man unterscheidet zwei Kabelarten: Das <b>Verlegekabel</b> liegt fest in der Wand zwischen Patchfeld und Netzwerkdose. Das <b>Patchkabel</b> ist flexibel und verbindet ein Gerät mit der Dose oder das Patchfeld mit dem Switch.</p>
      <div class="merke"><b>Maximale Länge:</b> Von einem aktiven Gerät zum nächsten (zum Beispiel PC zu Switch) dürfen es höchstens 100 m sein. Das gilt für die ganze Strecke aus Patchkabel, Verlegekabel und Patchkabel zusammen.</div>
      <p>Kabel unterscheiden sich in ihrer Schirmung. Der Teil vor dem Schrägstrich beschreibt den Gesamtschirm um alle Adern, der Teil danach die Schirmung der einzelnen Paare.</p>
      <table><tr><th>Kürzel</th><th>Bedeutung</th></tr>
      <tr><td>UTP</td><td>Unshielded Twisted Pair: gar keine Schirmung</td></tr>
      <tr><td>FTP</td><td>Foiled: jedes Paar mit Alufolie geschirmt</td></tr>
      <tr><td>STP</td><td>Shielded: jedes Paar mit Kupfergeflecht geschirmt</td></tr>
      <tr><td>S/UTP</td><td>Gesamtschirm, die Paare selbst sind ungeschirmt</td></tr>
      <tr><td>S/FTP</td><td>Gesamtschirm und jedes Paar mit Folie geschirmt</td></tr>
      <tr><td>S/STP</td><td>Gesamtschirm und jedes Paar geschirmt</td></tr></table>
      <p>Die <b>Kategorie</b> sagt, wie schnell ein Kabel sein kann. Laut Unterlagen schafft Cat5 100 Mbit/s, Cat5e bis 1 Gbit/s, Cat6 1 Gbit/s, Cat6a und Cat7 10 Gbit/s und Cat8 bis 40 Gbit/s auf 30 m.</p>`,
    },
    {
      h: 'Crossover-Kabel und Auto-MDI-X',
      html: `<p>Früher brauchte man ein <b>Crossover-Kabel</b>, um zwei gleichartige Geräte direkt zu verbinden, zum Beispiel PC mit PC oder Switch mit Switch. In diesem Kabel sind die Sende- und Empfangsadern gekreuzt.</p>
      <p>Heute ist das fast immer überflüssig. Die Geräte beherrschen <b>Auto-MDI-X</b>: Sie erkennen selbst, ob gekreuzt werden muss, und erledigen das elektronisch. Ein normales Patchkabel funktioniert dann überall.</p>`,
    },
    {
      h: 'Glasfaser (LWL)',
      html: `<p>Lichtwellenleiter (LWL) übertragen Daten als Lichtimpulse. Ein Laser oder eine LED sendet, eine Photodiode empfängt. Jede Faser überträgt nur in eine Richtung, deshalb nutzt man meist zwei Fasern.</p>
      <table><tr><th></th><th>Singlemode (SMF)</th><th>Multimode (MMF)</th></tr>
      <tr><td>Kern</td><td>sehr dünn</td><td>dicker</td></tr>
      <tr><td>Lichtquelle</td><td>Laser (teuer)</td><td>LED (günstiger)</td></tr>
      <tr><td>Reichweite</td><td>viele Kilometer</td><td>einige hundert Meter, bis ca. 550 m</td></tr>
      <tr><td>Typische Farbe</td><td>gelb</td><td>orange, OM3/OM4 oft türkis</td></tr>
      <tr><td>Einsatz</td><td>Weitverkehr, zwischen Standorten</td><td>im Gebäude und auf dem Gelände</td></tr></table>
      <p>Bei Multimode gibt es Klassen: OM1 und OM2 für bis zu 1 Gbit/s, OM3 und OM4 für 10 Gbit/s und mehr. Übliche Stecker sind <b>LC</b> (Lucent Connector, oft im Rechenzentrum), <b>SC</b> (Subscriber Connector) und <b>ST</b> (Straight Tip).</p>
      <p>Der Unterschied liegt im <b>Kern</b>, also im inneren Glasfaden, durch den das Licht läuft. Bei Singlemode ist er nur etwa <b>9 µm</b> dick, bei Multimode <b>50 µm oder 62,5 µm</b>. Das umgebende Mantelglas ist bei beiden 125 µm dick. Im dünnen Singlemode-Kern läuft das Licht praktisch auf einem einzigen Weg. Im dickeren Multimode-Kern nimmt es mehrere Wege, kommt dadurch zeitlich etwas verschmiert an und wird stärker gedämpft.</p>
      <table><tr><th></th><th>Vorteile</th><th>Nachteile</th></tr>
      <tr><td>Singlemode</td><td>geringe Dämpfung, kaum Laufzeitunterschiede, große Entfernungen, hohe Bandbreite</td><td>teurer Laser nötig, aufwendige Herstellung, Stecker und Spleiße müssen sehr genau sitzen</td></tr>
      <tr><td>Multimode</td><td>einfacher herzustellen, einfachere Verbindungstechnik wegen des dickeren Kerns</td><td>höhere Dämpfung, geringere Bandbreite, nur kürzere Strecken</td></tr></table>
      <p>Glasfaser allgemein hat große Vorteile: hohe Übertragungsraten, große Reichweite, keine Störung durch elektromagnetische Felder, keine Probleme mit Strom oder Blitzschlag und hohe Abhörsicherheit. Dafür ist sie teurer als Kupfer, die Installation braucht Fachwissen und Spezialwerkzeug, die Stecker sind empfindlich gegen Schmutz, und wird das Kabel zu stark geknickt, kann die Faser brechen. Strom für Geräte (Power over Ethernet) lässt sich über Glasfaser nicht übertragen.</p>
      <div class="merke"><b>Hinweis zu Reichweiten:</b> Manche Lernkarten nennen für Multimode bis zu 2 km und für Singlemode bis zu 10 km. Die tatsächliche Reichweite hängt stark von der Übertragungsrate ab. Für eure Klausur gelten die Werte aus dem Unterricht: Multimode bis ca. 550 m, Singlemode viele Kilometer.</div>`,
    },
    {
      h: 'Dämpfung und Störungen',
      html: `<p>Auf dem Weg durch das Kabel wird ein Signal schwächer. Das nennt man <b>Dämpfung</b>. Sie wird in Dezibel (dB) angegeben, bei Kabeln meist pro Kilometer (dB/km). Je länger das Kabel, desto größer die Dämpfung.</p>
      <p>Bei Glasfaser berechnet man das <b>Dämpfungsbudget</b>. Es setzt sich aus der Kabeldämpfung und der Dämpfung der Steckverbindungen zusammen.</p>
      <div class="rechnung"><p>Beispiel: 90 m Multimode-LWL mit 3,0 dB/km, zwei Stecker mit je 0,75 dB</p><p>Kabel: 0,09 km · 3,0 dB/km = 0,27 dB<br>Stecker: 2 · 0,75 dB = 1,5 dB</p><p>Dämpfungsbudget: 0,27 dB + 1,5 dB = <b>1,77 dB</b></p></div>
      <p>Daneben gibt es <b>Störungen</b>. EMI und RFI sind elektromagnetische Einflüsse von außen, etwa von Motoren oder Stromleitungen. Beim <b>Übersprechen</b> stört ein Adernpaar das benachbarte Paar. Bei einer Kabelprüfung misst man dafür unter anderem NEXT (Übersprechen am nahen Ende) und FEXT (am fernen Ende).</p>`,
    },
    {
      h: 'Halbduplex, Vollduplex und Zugriffsverfahren',
      html: `<p>Bei <b>Halbduplex</b> kann ein Gerät entweder senden oder empfangen, aber nicht beides gleichzeitig. Bei <b>Vollduplex</b> geht beides gleichzeitig. Wichtig: Beide Seiten einer Verbindung müssen denselben Modus nutzen. Sonst kommt es zu Fehlern und langen Wartezeiten.</p>
      <p>Wenn sich mehrere Geräte ein Medium teilen, braucht es Regeln, wer wann senden darf:</p>
      <ul><li><b>CSMA/CD</b> (Collision Detection) wird bei Ethernet im Halbduplex verwendet. Geräte senden, erkennen eine Kollision und senden dann erneut.</li>
      <li><b>CSMA/CA</b> (Collision Avoidance) wird bei WLAN verwendet. Funk kann Kollisionen nicht zuverlässig erkennen. Deshalb wartet ein Gerät vor dem Senden ab und lässt sich den Empfang bestätigen.</li>
      <li><b>Token Ring</b> ist ein kontrollierter Zugriff: Nur wer das Token hat, darf senden.</li></ul>`,
    },
    {
      h: 'Netze nach Größe',
      html: `<p>Ein <b>LAN</b> ist ein lokales Netz, etwa in einem Gebäude. Ein <b>MAN</b> deckt eine Stadt ab, ein <b>WAN</b> große Entfernungen über einen Provider. Das größte <b>GAN</b> (Global Area Network) ist das Internet. Ein <b>SAN</b> ist ein Storage Area Network, also ein eigenes Netz für Speichersysteme.</p>`,
    },
  ],
  questions: [
    { id: 'k1', type: 'mc', q: 'Wie lang darf eine Twisted-Pair-Strecke von aktivem zu aktivem Gerät höchstens sein?', options: ['100 m', '90 m', '185 m', '500 m'], answer: 0, explain: 'Die ganze Strecke darf 100 m lang sein. Üblich sind bis zu 90 m Verlegekabel plus die Patchkabel an beiden Enden.' },
    { id: 'k2', type: 'mc', q: 'Welcher Bereich der strukturierten Verkabelung verbindet <b>Gebäude</b> miteinander?', options: ['Primärverkabelung', 'Sekundärverkabelung', 'Tertiärverkabelung', 'Patchverkabelung'], answer: 0, explain: 'Die Primärverkabelung verbindet Gebäude auf einem Gelände. Die Sekundärverkabelung verbindet die Etagen, die Tertiärverkabelung führt zu den Arbeitsplätzen.' },
    { id: 'k3', type: 'mc', q: 'Welcher Bereich ist die <b>waagerechte</b> Verkabelung zu den Arbeitsplätzen?', options: ['Tertiärverkabelung', 'Primärverkabelung', 'Sekundärverkabelung', 'Backbone'], answer: 0, explain: 'Die Tertiärverkabelung (Etagenverkabelung) läuft auf einer Etage zu den Arbeitsplätzen. Sie besteht meist aus Kupfer.' },
    { id: 'k4', type: 'mc', q: 'Warum verbindet man Gebäude mit <b>Glasfaser</b>?', options: ['Wegen der großen Reichweite und der galvanischen Trennung', 'Weil Kupfer teurer ist', 'Weil nur Glasfaser Vollduplex kann', 'Wegen Power over Ethernet'], answer: 0, explain: 'Glasfaser schafft weite Strecken und leitet keinen Strom. So fließen keine Ausgleichsströme zwischen den Gebäuden, und Blitzeinschläge werden nicht weitergeleitet.' },
    { id: 'k5', type: 'mc', q: 'Was bedeutet <b>S/UTP</b>?', options: ['Gesamtschirm um das Kabel, die Paare selbst sind ungeschirmt', 'Jedes Paar und das Kabel sind geschirmt', 'Gar keine Schirmung', 'Die Paare sind mit Folie geschirmt'], answer: 0, explain: 'S steht für Screened, also einen Gesamtschirm. UTP bedeutet, dass die einzelnen Paare nicht geschirmt sind.' },
    { id: 'k6', type: 'mc', q: 'Was ist bei <b>STP</b> geschirmt?', options: ['Jedes Adernpaar mit Kupfergeflecht', 'Nur der äußere Mantel', 'Nichts', 'Nur die Stecker'], answer: 0, explain: 'STP steht für Shielded Twisted Pair. Jedes Paar hat ein Kupfergeflecht. Bei FTP wäre es eine Folie.' },
    { id: 'k7', type: 'mc', q: 'Wofür brauchte man früher ein <b>Crossover-Kabel</b>?', options: ['Um zwei gleichartige Geräte direkt zu verbinden, zum Beispiel PC mit PC', 'Um einen PC mit einem Switch zu verbinden', 'Um Glasfaser mit Kupfer zu verbinden', 'Um Strom zu übertragen'], answer: 0, explain: 'Bei gleichartigen Geräten müssen Sende- und Empfangsadern gekreuzt werden. Heute übernimmt Auto-MDI-X das automatisch.' },
    { id: 'k8', type: 'mc', q: 'Was macht <b>Auto-MDI-X</b>?', options: ['Es kreuzt Sende- und Empfangsadern bei Bedarf automatisch', 'Es erkennt die Kabelkategorie', 'Es wählt das VLAN', 'Es schaltet PoE ein'], answer: 0, explain: 'Das Gerät erkennt selbst, ob gekreuzt werden muss. Deshalb funktioniert heute ein normales Patchkabel auch zwischen zwei Switchen.' },
    { id: 'k9', type: 'mc', q: 'Welchen Stecker nennen die Unterlagen für Cat7?', options: ['GG45', 'RJ45', 'LC', 'BNC'], answer: 0, explain: 'Bis Cat6 nutzt man RJ45. Für Cat7 nennen die Unterlagen den GG45-Stecker (GigaGate).' },
    { id: 'k10', type: 'mc', q: 'Welche Lichtquelle braucht eine <b>Singlemode</b>-Faser?', options: ['Laser', 'LED', 'Glühlampe', 'Photodiode'], answer: 0, explain: 'Der Kern ist so dünn, dass nur ein Laser das Licht genau genug einkoppeln kann. Multimode kommt mit günstigeren LEDs aus. Eine Photodiode empfängt das Licht.' },
    { id: 'k11', type: 'mc', q: 'Wie weit reicht Multimode-Glasfaser ungefähr?', options: ['Einige hundert Meter, bis ca. 550 m', 'Bis 100 m', 'Mehrere hundert Kilometer', 'Bis 30 m'], answer: 0, explain: 'Multimode reicht bis etwa 550 m und wird im Gebäude und auf dem Gelände eingesetzt. Für Kilometer nimmt man Singlemode.' },
    { id: 'k12', type: 'mc', q: 'Welche Farbe hat ein <b>Singlemode</b>-Kabel typischerweise?', options: ['Gelb', 'Orange', 'Blau', 'Grau'], answer: 0, explain: 'Singlemode ist meist gelb, Multimode orange oder bei OM3/OM4 türkis.' },
    { id: 'k13', type: 'multi', q: 'Welche Vorteile hat Glasfaser gegenüber Kupfer?', options: ['Geringe Dämpfung und große Reichweite', 'Keine Probleme mit elektromagnetischen Störungen', 'Keine Gefahr durch Blitzeinschlag', 'Man kann sie leicht selbst konfektionieren'], answer: [0, 1, 2], explain: 'Die ersten drei sind die klassischen Vorteile. Glasfaser selbst zu konfektionieren ist dagegen aufwendig, weil die Faserenden sehr sauber sein müssen.' },
    { id: 'k14', type: 'mc', q: 'In welcher Einheit gibt man Dämpfung an?', options: ['Dezibel (dB)', 'Ohm (Ω)', 'Megahertz (MHz)', 'AWG'], answer: 0, explain: 'Dämpfung misst man in dB, bei Kabeln meist in dB pro Kilometer. Ohm ist der elektrische Widerstand, AWG der Aderdurchmesser.' },
    { id: 'k15', type: 'input', q: 'Berechne das Dämpfungsbudget: 90 m Multimode-LWL mit 3,0 dB/km und 2 Stecker mit je 0,75 dB. Ergebnis in dB?', accept: ['1,77', '1.77', '1,77db', '1.77db'], explain: 'Kabel: 0,09 km · 3,0 dB/km = 0,27 dB. Stecker: 2 · 0,75 dB = 1,5 dB. Zusammen ergibt das 1,77 dB.' },
    { id: 'k16', type: 'mc', q: 'Welches Zugriffsverfahren nutzt <b>WLAN</b>?', options: ['CSMA/CA', 'CSMA/CD', 'Token Passing', 'TDMA'], answer: 0, explain: 'Funk kann Kollisionen nicht zuverlässig erkennen. Deshalb versucht WLAN, sie zu vermeiden (Collision Avoidance): vorher warten und den Empfang bestätigen lassen.' },
    { id: 'k17', type: 'mc', q: 'Wo wird <b>CSMA/CD</b> eingesetzt?', options: ['Bei Ethernet im Halbduplex', 'Bei WLAN', 'Im Glasfaser-Backbone', 'An Switch-Ports mit Vollduplex'], answer: 0, explain: 'CSMA/CD braucht man, wenn sich Geräte ein Medium teilen, etwa an einem Hub. Mit Vollduplex am Switch gibt es keine Kollisionen mehr.' },
    { id: 'k18', type: 'tf', q: 'Bei Vollduplex müssen beide Seiten einer Verbindung denselben Duplex-Modus nutzen.', answer: true, explain: 'Sonst entsteht ein sogenannter Duplex-Mismatch. Die Verbindung wird dann langsam und fehleranfällig.' },
    { id: 'k19', type: 'mc', q: 'Was misst <b>NEXT</b> bei einer Kupferkabelprüfung?', options: ['Das Übersprechen am nahen Ende', 'Das Übersprechen am fernen Ende', 'Den Reflexionsverlust', 'Die Kabellänge'], answer: 0, explain: 'NEXT steht für Near End Crosstalk. FEXT ist das Übersprechen am fernen Ende, RL (Return Loss) der Reflexionsverlust.' },
    { id: 'k20', type: 'mc', q: 'Welches Netz deckt eine Stadt ab?', options: ['MAN', 'LAN', 'SAN', 'GAN'], answer: 0, explain: 'MAN steht für Metropolitan Area Network, also ein Netz in Stadtgröße.' },
    { id: 'k21', type: 'mc', q: 'Welche Kabelkategorie nennen die Unterlagen für 10 Gbit/s?', options: ['Cat6a und Cat7', 'Cat5', 'Cat5e', 'Cat3'], answer: 0, explain: 'Cat6a und Cat7 sind für 10-Gigabit-Ethernet geeignet. Cat5e schafft bis 1 Gbit/s.' },
    { id: 'k22', type: 'mc', q: 'Wofür steht <b>RJ</b> in RJ45?', options: ['Registered Jack', 'Rapid Junction', 'Rear Jack', 'Router Join'], answer: 0, explain: 'Registered Jack bedeutet genormte Buchse. Technisch korrekt heißt der Stecker 8P8C (8 Positionen, 8 Kontakte).' },
    { id: 'k23', type: 'mc', q: 'Wie dick ist der Kern einer <b>Singlemode</b>-Faser ungefähr?', options: ['9 µm', '50 µm', '62,5 µm', '125 µm'], answer: 0, explain: 'Singlemode hat einen Kern von etwa 9 µm. Multimode hat 50 oder 62,5 µm. 125 µm ist der Durchmesser des Mantelglases bei beiden.' },
    { id: 'k24', type: 'multi', q: 'Welche Aussagen sind <b>Nachteile</b> von Glasfaser?', options: ['Die Stecker sind empfindlich gegen Schmutz', 'Bei starkem Knicken kann die Faser brechen', 'Power over Ethernet ist nicht möglich', 'Elektromagnetische Felder stören die Übertragung'], answer: [0, 1, 2], explain: 'Gegen elektromagnetische Störungen ist Glasfaser gerade unempfindlich, das ist einer ihrer großen Vorteile.' },
    { id: 'k25', type: 'mc', q: 'Was bedeutet <b>S/FTP</b> bei Twisted-Pair-Kabeln?', options: ['Gesamtschirm um alle Paare, dazu jedes Paar mit Folie geschirmt', 'Keine Schirmung', 'Nur ein Gesamtschirm', 'Jedes Paar mit Kupfergeflecht, kein Gesamtschirm'], answer: 0, explain: 'S vor dem Schrägstrich steht für den Gesamtschirm, FTP für die Folie um jedes einzelne Paar.' },
    { id: 'k26', type: 'mc', q: 'Warum ist die Verbindungstechnik bei <b>Multimode</b> einfacher als bei Singlemode?', options: ['Der Kern ist dicker, deshalb muss beim Verbinden nicht so genau gearbeitet werden', 'Multimode braucht keine Stecker', 'Multimode wird mit Kupfer verbunden', 'Multimode hat keinen Mantel'], answer: 0, explain: 'Bei einem Kern von 50 µm statt 9 µm ist mehr Spielraum, wenn zwei Fasern aufeinandertreffen.' },
    { id: 'k27', type: 'mc', q: 'Was ist der Unterschied zwischen <b>Patchkabel</b> und <b>Verlegekabel</b>?', options: ['Das Patchkabel ist flexibel und steckt am Gerät, das Verlegekabel liegt fest in der Wand', 'Das Patchkabel ist aus Glasfaser, das Verlegekabel aus Kupfer', 'Das Verlegekabel ist immer gekreuzt', 'Es gibt keinen Unterschied'], answer: 0, explain: 'Das Verlegekabel verbindet Patchfeld und Netzwerkdose fest. Die flexiblen Patchkabel verbinden an beiden Enden die Geräte.' },
    { id: 'k28', type: 'mc', q: 'Was bedeutet <b>Halbduplex</b>?', options: ['Ein Gerät kann senden oder empfangen, aber nicht beides gleichzeitig', 'Ein Gerät sendet nur mit halber Geschwindigkeit', 'Nur die Hälfte der Adern wird genutzt', 'Senden und Empfangen gleichzeitig'], answer: 0, explain: 'Bei Halbduplex wechseln Senden und Empfangen sich ab. Gleichzeitig geht es erst bei Vollduplex.' },
  ],
  pairs: [
    { title: 'Schirmung', items: [['UTP', 'keine Schirmung'], ['FTP', 'Paare mit Alufolie'], ['STP', 'Paare mit Kupfergeflecht'], ['S/UTP', 'nur Gesamtschirm'], ['S/STP', 'Gesamtschirm und Paare']] },
    { title: 'Begriffe', items: [['Primärverkabelung', 'zwischen Gebäuden'], ['Sekundärverkabelung', 'zwischen Etagen'], ['Tertiärverkabelung', 'bis zum Arbeitsplatz'], ['CSMA/CD', 'Ethernet im Halbduplex'], ['CSMA/CA', 'WLAN'], ['Auto-MDI-X', 'ersetzt das Crossover-Kabel']] },
    { title: 'Glasfaser', items: [['Singlemode', 'Laser, viele km, gelb'], ['Multimode', 'LED, bis ca. 550 m, orange'], ['LC', 'Lucent Connector'], ['SC', 'Subscriber Connector'], ['OM3/OM4', '10 Gbit/s und mehr']] },
  ],
};

export const topologien = {
  id: 'topologien', title: 'Topologien', color: '#D9A400',
  blurb: 'Wie Geräte und Standorte miteinander verbunden sind: Stern, Ring, Bus, Masche und mehr.',
  gens: ['mesh'],
  learn: [
    {
      h: 'Physische und logische Topologie',
      html: `<p>Eine Topologie beschreibt, wie die Geräte in einem Netz miteinander verbunden sind. Man kann ein Netz auf zwei Arten betrachten:</p>
      <ul><li>Die <b>physische Topologie</b> zeigt den tatsächlichen Aufbau: wo die Geräte stehen, wie die Kabel verlaufen, wie der Grundriss aussieht.</li>
      <li>Die <b>logische Topologie</b> zeigt, wie die Daten fließen: das IP-Adressschema, die Gerätenamen und welche Anschlüsse genutzt werden.</li></ul>
      <p>Beide müssen nicht gleich sein. Ein Hub ist zum Beispiel physisch ein Stern, logisch aber ein Bus, weil sich alle angeschlossenen Geräte das Medium teilen.</p>`,
    },
    {
      h: 'Topologien im WAN',
      html: `<p>Im WAN geht es darum, wie Standorte verbunden sind.</p>
      <ul><li><b>Punkt-zu-Punkt</b> ist die einfachste Form: eine direkte, dauerhafte Verbindung zwischen zwei Endpunkten.</li>
      <li><b>Hub-and-Spoke</b> ist ein Stern im WAN. Jeder Standort ist nur mit der Zentrale verbunden, und der gesamte Datenverkehr läuft über die Zentrale.</li>
      <li>Bei einer <b>Vollvermaschung (Mesh)</b> ist jeder Standort mit jedem verbunden. Weil es zwischen zwei Punkten immer mehrere Wege gibt, ist das sehr ausfallsicher und leistungsfähig. Mit jedem neuen Standort steigt die Zahl der Verbindungen aber stark an. Das macht die Vollvermaschung teuer und aufwendig zu verwalten.</li>
      <li>Eine <b>Hybrid-Topologie</b> kombiniert verschiedene Formen, zum Beispiel eine Teilvermaschung, bei der nur einige Standorte direkt verbunden sind.</li></ul>
      <div class="rechnung"><p>Wie viele Verbindungen braucht eine Vollvermaschung?</p><p>Jeder der n Standorte braucht eine Verbindung zu allen anderen, also n − 1. Weil jede Verbindung dabei doppelt gezählt wird, teilt man durch 2.</p><p>Formel: <b>n · (n − 1) : 2</b>. Bei 6 Standorten: 6 · 5 : 2 = 15 Verbindungen.</p></div>`,
    },
    {
      h: 'Topologien im LAN',
      html: `<p><b>Stern:</b> Alle Geräte hängen an einem zentralen Punkt, heute fast immer ein Switch. Das ist einfach zu installieren, gut erweiterbar, und Fehler lassen sich schnell finden. Der Nachteil: Fällt der Switch aus, ist das ganze Netz betroffen.</p>
      <p><b>Erweiterter Stern:</b> Mehrere Sterne werden miteinander verbunden. Das ist eine Hybrid-Topologie und heute der Standard in Gebäuden. Oft heißt sie auch <b>Baumtopologie</b>: Von einem zentralen Knoten, dem „Stamm“, gehen Verzweigungen zu weiteren Sternen aus. Sie lässt sich gut erweitern, weil man neue Äste anhängen kann, ohne das ganze Netz umzubauen.</p>
      <p><b>Ring:</b> Jedes Gerät ist mit seinen beiden Nachbarn verbunden. Ein Abschlusswiderstand ist nicht nötig. Früher nutzten Token Ring und FDDI diese Form, heute ist sie veraltet.</p>
      <p><b>Bus:</b> Alle Geräte hängen an einer gemeinsamen Leitung, aktive Verteiler braucht man nicht. An beiden Enden muss ein Abschlusswiderstand sitzen. Früher lief Ethernet so über Koaxialkabel (10Base2 und 10Base5). Im Büro gibt es das nicht mehr, in Autos und Industrieanlagen ist der Bus aber weiterhin verbreitet.</p>`,
    },
  ],
  questions: [
    { id: 't1', type: 'mc', q: 'Was beschreibt die <b>logische</b> Topologie?', options: ['Wie die Daten fließen: IP-Schema, Namen, Anschlüsse', 'Wie die Kabel im Gebäude verlaufen', 'Wo die Geräte im Grundriss stehen', 'Welche Kabelkategorie verwendet wird'], answer: 0, explain: 'Die logische Topologie zeigt den Datenfluss. Wie tatsächlich verkabelt ist, zeigt die physische Topologie.' },
    { id: 't2', type: 'mc', q: 'Welche LAN-Topologie ist heute Standard?', options: ['Der (erweiterte) Stern', 'Der Bus', 'Der Ring', 'Die Vollvermaschung'], answer: 0, explain: 'Heute hängen die Geräte an Switchen, und mehrere Switche sind miteinander verbunden. Das ist ein erweiterter Stern.' },
    { id: 't3', type: 'mc', q: 'Bei welcher Topologie braucht man an beiden Enden einen <b>Abschlusswiderstand</b>?', options: ['Bus', 'Ring', 'Stern', 'Masche'], answer: 0, explain: 'Beim Bus über Koaxialkabel verhindern die Abschlusswiderstände, dass das Signal am Kabelende zurückgeworfen wird. Der Ring braucht keinen.' },
    { id: 't4', type: 'mc', q: 'Wo wird die <b>Bus</b>-Topologie heute noch häufig eingesetzt?', options: ['In Autos und Industrieanlagen', 'In Büronetzen', 'In Rechenzentren', 'Im WLAN'], answer: 0, explain: 'In Ethernet-Netzen gibt es den Bus nicht mehr. In Fahrzeugen und Maschinen ist er aber weiterhin üblich.' },
    { id: 't5', type: 'mc', q: 'Welche Technologien nutzten die <b>Ring</b>-Topologie?', options: ['Token Ring und FDDI', '10Base2 und 10Base5', 'WLAN und Bluetooth', 'DSL und FTTH'], answer: 0, explain: 'Token Ring und FDDI arbeiteten im Ring. Heute ist diese Topologie veraltet.' },
    { id: 't6', type: 'mc', q: 'Was ist typisch für <b>Hub-and-Spoke</b>?', options: ['Der gesamte Verkehr läuft über die Zentrale', 'Jeder Standort ist mit jedem verbunden', 'Alle Standorte hängen an einer Leitung', 'Jeder Standort ist nur mit seinem Nachbarn verbunden'], answer: 0, explain: 'Jeder Außenstandort hat eine Verbindung zur Zentrale. Wollen zwei Außenstandorte miteinander reden, geht das über die Zentrale.' },
    { id: 't7', type: 'multi', q: 'Welche Aussagen zur <b>Vollvermaschung</b> stimmen?', options: ['Sie ist sehr ausfallsicher', 'Die Anschaffung ist teuer', 'Die Verwaltung ist aufwendig', 'Sie hat einen zentralen Ausfallpunkt'], answer: [0, 1, 2], explain: 'Weil jeder mit jedem verbunden ist, gibt es gerade keinen zentralen Punkt, dessen Ausfall alles lahmlegt.' },
    { id: 't8', type: 'input', q: 'Wie viele Verbindungen braucht ein vollvermaschtes Netz mit <b>6</b> Standorten?', accept: ['15'], explain: 'Mit der Formel n · (n − 1) : 2 ergibt sich 6 · 5 : 2 = 15.' },
    { id: 't9', type: 'mc', q: 'Was ist ein Nachteil der <b>Stern</b>-Topologie?', options: ['Fällt der zentrale Switch aus, ist das ganze Netz betroffen', 'Man braucht Abschlusswiderstände', 'Die Fehlersuche ist schwierig', 'Sie ist schlecht erweiterbar'], answer: 0, explain: 'Der zentrale Switch ist ein Single Point of Failure. Leichte Fehlersuche und gute Erweiterbarkeit sind dagegen Vorteile des Sterns.' },
    { id: 't10', type: 'mc', q: 'Was ist die einfachste WAN-Topologie?', options: ['Punkt-zu-Punkt', 'Vollvermaschung', 'Hub-and-Spoke', 'Hybrid'], answer: 0, explain: 'Punkt-zu-Punkt ist eine direkte, dauerhafte Verbindung zwischen zwei Endpunkten.' },
    { id: 't11', type: 'tf', q: 'Ein erweiterter Stern ist eine Hybrid-Topologie.', answer: true, explain: 'Mehrere Sterne werden miteinander verbunden. Es werden also Topologien kombiniert.' },
    { id: 't12', type: 'tf', q: 'Physische und logische Topologie eines Netzes sind immer gleich.', answer: false, explain: 'Ein Hub ist zum Beispiel physisch ein Stern, logisch aber ein Bus, weil sich alle Geräte das Medium teilen.' },
    { id: 't13', type: 'mc', q: 'Wie nennt man den <b>erweiterten Stern</b> auch?', options: ['Baumtopologie', 'Ringtopologie', 'Bustopologie', 'Punkt-zu-Punkt'], answer: 0, explain: 'Bei der Baumtopologie gehen von einem zentralen Knoten Verzweigungen zu weiteren Sternen aus, wie Äste von einem Stamm.' },
    { id: 't14', type: 'mc', q: 'Was beschreibt die <b>physische</b> Topologie?', options: ['Den tatsächlichen Aufbau: Standorte der Geräte, Kabelverlauf, Grundriss', 'Den Datenfluss und das IP-Schema', 'Die Namen der Geräte', 'Die Verschlüsselung'], answer: 0, explain: 'Physisch heißt: wie es wirklich verkabelt ist. Wie die Daten fließen, zeigt die logische Topologie.' },
  ],
  pairs: [
    { title: 'Topologie und Merkmal', items: [['Stern', 'zentraler Switch'], ['Bus', 'Abschlusswiderstände'], ['Ring', 'Token Ring, FDDI'], ['Vollvermaschung', 'jeder mit jedem'], ['Hub-and-Spoke', 'alles über die Zentrale'], ['Hybrid', 'Kombination mehrerer Formen']] },
  ],
};

export const switching = {
  id: 'switch', title: 'Switch', color: '#1A9AA0',
  blurb: 'Wie ein Switch MAC-Adressen lernt und Frames gezielt weiterleitet, und was ihn vom Hub unterscheidet.',
  gens: [],
  learn: [
    {
      h: 'Was ein Switch macht',
      html: `<p>Ein Switch verbindet Geräte in einem lokalen Netz miteinander. Er ist der Nachfolger des Hubs. Den ersten Switch gab es 1990 von der Firma Kalpana, die später von Cisco gekauft wurde.</p>
      <p>Einfache Switche werden einfach eingesteckt und funktionieren sofort (Plug-and-Play). Sie arbeiten auf Schicht 2 und lassen sich nicht konfigurieren. <b>Managed Switche</b> kann man einrichten, zum Beispiel für VLANs. <b>Layer-3-Switche</b> können zusätzlich zwischen Netzen routen.</p>`,
    },
    {
      h: 'Die MAC-Adresse',
      html: `<p>Jeder Netzwerkadapter hat eine eigene Hardware-Adresse, die <b>MAC-Adresse</b> (Media Access Control). Sie ist 48 Bit lang, also 6 Byte, und wird hexadezimal geschrieben, zum Beispiel <span class="mono">08:00:20:ae:fd:7e</span>. Damit gibt es etwa 281 Billionen mögliche Adressen.</p>
      <p>Die MAC-Adresse besteht aus zwei Hälften zu je 24 Bit. Die erste Hälfte heißt <b>OUI</b> (Organizationally Unique Identifier) und zeigt, welcher Hersteller den Adapter gebaut hat. Die zweite Hälfte vergibt der Hersteller selbst als fortlaufende Nummer für das einzelne Gerät.</p>
      <p>Unter Windows zeigt der Befehl <span class="mono">ipconfig /all</span> die MAC-Adresse als „Physische Adresse“ an. Unter Linux geht das mit <span class="mono">ip link</span>.</p>`,
    },
    {
      h: 'Von der IP- zur MAC-Adresse: ARP',
      html: `<p>Ein PC kennt meistens nur die IP-Adresse seines Ziels. Um einen Frame zu bauen, braucht er aber die MAC-Adresse. Diese findet er mit dem <b>Address Resolution Protocol (ARP)</b> heraus.</p>
      <p>Der PC schickt dazu eine ARP-Anfrage als Broadcast an alle Geräte im Netz, sinngemäß: „Wer hat die IP-Adresse 192.168.1.20? Bitte sag mir deine MAC-Adresse.“ Nur das Gerät mit dieser IP antwortet, und zwar direkt an den Fragenden. Die Antwort merkt sich der PC eine Weile in seinem ARP-Cache. Unter Windows zeigt <span class="mono">arp -a</span> diesen Cache an.</p>
      <p>ARP funktioniert nur im eigenen Netz, weil Router Broadcasts nicht weiterleiten. Liegt das Ziel in einem anderen Netz, fragt der PC per ARP nach der MAC-Adresse seines Default-Gateways.</p>`,
    },
    {
      h: 'Lernen und Weiterleiten',
      html: `<p>Ein Switch merkt sich, welches Gerät an welchem Anschluss (Port) hängt. Dafür führt er eine Tabelle, die in den Unterlagen <b>Source Address Table (SAT)</b> heißt. Oft sagt man auch MAC-Tabelle.</p>
      <p>Das läuft in drei Schritten ab:</p>
      <ol><li><b>Lernen:</b> Kommt ein Frame an, schaut der Switch auf die <b>Quell-MAC</b>, also den Absender. Er trägt ein: „Diese MAC-Adresse sitzt hinter diesem Port.“</li>
      <li><b>Gezielt weiterleiten:</b> Kennt der Switch die <b>Ziel-MAC</b> schon, schickt er den Frame nur an den passenden Port.</li>
      <li><b>Fluten:</b> Kennt er die Ziel-MAC noch nicht, oder ist es ein Broadcast, schickt er den Frame an alle aktiven Ports außer dem, auf dem er hereinkam. Sobald das Ziel antwortet, lernt der Switch auch dessen Port.</li></ol>
      <div class="merke"><b>Merke:</b> Gelernt wird immer aus der Quell-MAC. Entschieden wird anhand der Ziel-MAC.</div>`,
    },
    {
      h: 'Hub und Switch im Vergleich',
      html: `<p>Ein <b>Hub</b> arbeitet auf Schicht 1. Er schickt jedes Signal an alle Ports. Alle Geräte teilen sich die Leitung, und das langsamste Gerät bestimmt das Tempo. Es kann zu Kollisionen kommen.</p>
      <p>Ein <b>Switch</b> arbeitet auf Schicht 2. Er verbindet zwei Ports direkt miteinander. Jede Verbindung läuft mit voller Geschwindigkeit und im Vollduplex. An einem Switch-Port mit Vollduplex gibt es keine Kollisionen.</p>
      <p>Im Unterricht verwendet ihr den Netgear GS308: 8 Gigabit-Ports, Auto-MDI/MDIX, Plug-and-Play, Layer 2 und ohne Lüfter.</p>`,
    },
  ],
  questions: [
    { id: 'w1', type: 'mc', q: 'Was speichert ein Switch in seiner Tabelle?', options: ['Die Quell-MAC-Adresse und den Port, an dem der Frame ankam', 'Die Ziel-IP-Adresse', 'Die Quell-IP-Adresse und den Port', 'Die Ziel-MAC-Adresse und den Ausgangsport'], answer: 0, explain: 'Der Switch lernt vom Absender. Er merkt sich: Diese MAC-Adresse sitzt hinter diesem Port.' },
    { id: 'w2', type: 'mc', q: 'Wie heißt die Tabelle des Switches in den Unterlagen?', options: ['Source Address Table (SAT)', 'Routing-Tabelle', 'ARP-Cache', 'NAT-Tabelle'], answer: 0, explain: 'In den Unterlagen heißt sie Source Address Table. Oft sagt man auch MAC-Tabelle oder CAM-Tabelle.' },
    { id: 'w3', type: 'mc', q: 'Was macht ein Switch mit einem Frame, dessen <b>Ziel-MAC er nicht kennt</b>?', options: ['Er schickt ihn an alle aktiven Ports außer dem Eingangsport', 'Er verwirft ihn', 'Er schickt ihn an das Default-Gateway', 'Er schickt ihn zurück an den Absender'], answer: 0, explain: 'Das nennt man Fluten. Sobald das Ziel antwortet, lernt der Switch dessen Port und schickt künftig gezielt.' },
    { id: 'w4', type: 'mc', q: 'Wie lang ist eine MAC-Adresse?', options: ['48 Bit', '32 Bit', '64 Bit', '128 Bit'], answer: 0, explain: '48 Bit sind 6 Byte. Damit gibt es etwa 281 Billionen mögliche Adressen.' },
    { id: 'w5', type: 'mc', q: 'Mit welchem Befehl zeigt man unter Windows die MAC-Adresse an?', options: ['ipconfig /all', 'ping -a', 'netstat -r', 'tracert'], answer: 0, explain: 'ipconfig /all zeigt für jeden Adapter die „Physische Adresse“, also die MAC-Adresse.' },
    { id: 'w6', type: 'mc', q: 'Was ist der wichtigste Unterschied zwischen <b>Hub</b> und <b>Switch</b>?', options: ['Der Hub schickt alles an alle Ports, der Switch nur an den Zielport', 'Der Hub arbeitet auf Schicht 3', 'Der Switch kann keine Broadcasts weiterleiten', 'Der Hub ist schneller'], answer: 0, explain: 'Beim Hub teilen sich alle Geräte die Leitung. Der Switch verbindet Absender und Ziel direkt.' },
    { id: 'w7', type: 'mc', q: 'Wofür steht <b>MAC</b>?', options: ['Media Access Control', 'Machine Address Code', 'Main Access Channel', 'Multiple Access Collision'], answer: 0, explain: 'Media Access Control. Die MAC-Adresse gehört zur Sicherungsschicht.' },
    { id: 'w8', type: 'tf', q: 'Einen Broadcast-Frame (Ziel FF:FF:FF:FF:FF:FF) schickt der Switch an alle Ports im selben Netz.', answer: true, explain: 'Broadcasts werden geflutet. Erst ein Router oder eine VLAN-Grenze hält sie auf.' },
    { id: 'w9', type: 'mc', q: 'Welche Art von Switch kann zwischen VLANs <b>routen</b>?', options: ['Ein Layer-3-Switch', 'Ein einfacher Layer-2-Switch', 'Ein Hub', 'Ein Repeater'], answer: 0, explain: 'Ein Layer-3-Switch kann zusätzlich anhand von IP-Adressen vermitteln, also routen.' },
    { id: 'w10', type: 'mc', q: 'Welche Eigenschaft des GS308 macht Crossover-Kabel überflüssig?', options: ['Auto-MDI/MDIX', 'Plug-and-Play', 'Layer 2', 'Betrieb ohne Lüfter'], answer: 0, explain: 'Auto-MDI/MDIX erkennt selbst, ob die Adern gekreuzt werden müssen.' },
    { id: 'w11', type: 'tf', q: 'An einem Switch-Port mit Vollduplex können keine Kollisionen entstehen.', answer: true, explain: 'Senden und Empfangen laufen getrennt, und an jedem Port hängt nur ein Gerät.' },
    { id: 'w12', type: 'mc', q: 'Was gibt der <b>OUI</b>-Teil einer MAC-Adresse an?', options: ['Den Hersteller des Netzwerkadapters', 'Das VLAN des Geräts', 'Die IP-Adresse des Geräts', 'Den Switch-Port'], answer: 0, explain: 'Die ersten 24 Bit einer MAC-Adresse sind der OUI. Er ist jedem Hersteller fest zugeteilt. Die zweiten 24 Bit nummerieren die einzelnen Geräte.' },
    { id: 'w13', type: 'mc', q: 'Mit welchem Protokoll findet ein PC zu einer IP-Adresse die passende <b>MAC-Adresse</b>?', options: ['ARP', 'DNS', 'DHCP', 'ICMP'], answer: 0, explain: 'ARP schickt einen Broadcast „Wer hat diese IP?“, und das passende Gerät antwortet mit seiner MAC-Adresse. DNS löst dagegen Namen in IP-Adressen auf.' },
    { id: 'w14', type: 'tf', q: 'Ein Switch entscheidet anhand der <b>Ziel-MAC-Adresse</b> eines Frames, an welchen Port er ihn schickt.', answer: true, explain: 'Er liest die Ziel-MAC und schaut in seiner Tabelle nach, hinter welchem Port sie sitzt. Gelernt hat er diese Tabelle vorher aus den Quell-MAC-Adressen.' },
    { id: 'w15', type: 'mc', q: 'Was unterscheidet einen <b>managed</b> Switch von einem unmanaged Switch?', options: ['Er lässt sich konfigurieren, zum Beispiel für VLANs', 'Er hat immer mehr Ports', 'Er arbeitet nur auf Schicht 1', 'Er braucht keinen Strom'], answer: 0, explain: 'Ein unmanaged Switch wird nur eingesteckt und funktioniert. Einen managed Switch kann man einrichten, zum Beispiel VLANs anlegen.' },
  ],
  pairs: [
    { title: 'Hub oder Switch?', items: [['schickt alles an alle Ports', 'Hub'], ['lernt MAC-Adressen', 'Switch'], ['arbeitet auf Schicht 1', 'Hub'], ['arbeitet auf Schicht 2', 'Switch'], ['verbindet zwei Ports direkt', 'Switch'], ['das langsamste Gerät bremst alle', 'Hub']] },
  ],
};

export const vlan = {
  id: 'vlan', title: 'VLAN', color: '#2E8B57',
  blurb: 'Ein physisches Netz in mehrere logische Netze aufteilen, mit und ohne Tags.',
  gens: [],
  learn: [
    {
      h: 'Was ein VLAN ist',
      html: `<p>Mit einem VLAN (Virtual Local Area Network) teilt man ein physisches Netz in mehrere <b>logische Netze</b> auf. Jedes VLAN verhält sich so, als wäre es mit einem eigenen, unabhängigen Switch aufgebaut.</p>
      <p>Das hat einen großen Vorteil: Man kann zum Beispiel die Buchhaltung und die Produktion voneinander trennen, ohne zusätzliche Switche zu kaufen. Jedes VLAN ist eine eigene Broadcast-Domäne. Broadcasts aus einem VLAN erreichen die anderen nicht.</p>
      <p>VLANs können Layer-2-Switche mit VLAN-Funktion (also managed Switche). Layer-3-Switche können außerdem zwischen VLANs routen.</p>`,
    },
    {
      h: 'Portbasierte VLANs',
      html: `<p>Bei einem portbasierten VLAN wird jeder Port des Switches genau einem VLAN zugeordnet. Man spricht auch von einem <b>Access-Port</b>. Nur Geräte im selben VLAN können direkt miteinander kommunizieren.</p>
      <div class="rechnung"><p>Beispiel aus dem Unterricht: Switch A</p><p>Port 1 bis 4 gehören zu VLAN 1, Port 5 bis 8 zu VLAN 2.<br>PC A-1 an Port 1 und PC A-2 an Port 2 können sich erreichen. PC A-5 an Port 5 und PC A-6 an Port 6 auch. Zwischen den beiden Gruppen geht nichts.</p></div>
      <p>Werden die Ports von Hand fest einem VLAN zugeordnet, spricht man von <b>statischen VLANs</b>. Das portbasierte VLAN aus dem Unterricht ist so ein statisches VLAN. Bei <b>dynamischen VLANs</b> ordnet der Switch ein Gerät automatisch einem VLAN zu, zum Beispiel anhand seiner MAC-Adresse. Steckt man den Laptop dann an einen anderen Port, landet er trotzdem im richtigen VLAN.</p>
      <p>Will man zwei Switche portbasiert verbinden, braucht man <b>für jedes VLAN ein eigenes Kabel</b>. Bei zwei VLANs sind das also zwei Kabel, zum Beispiel von Port 4 zu Port 4 für VLAN 1 und von Port 8 zu Port 8 für VLAN 2.</p>`,
    },
    {
      h: 'Tagged VLANs und Trunks',
      html: `<p>Damit nicht für jedes VLAN ein eigenes Kabel nötig ist, gibt es <b>Tagged VLANs</b> nach dem Standard <b>IEEE 802.1Q</b>. Dann laufen mehrere VLANs über ein einziges Kabel. So eine Verbindung heißt <b>Trunk</b>.</p>
      <p>Damit die Gegenseite weiß, zu welchem VLAN ein Frame gehört, bekommt er auf dem Trunk eine Markierung, den <b>VLAN-Tag</b>. Der Tag ist 4 Byte groß und steht im Ethernet-Frame direkt nach den beiden MAC-Adressen.</p>
      <div class="merke"><b>Merke:</b> Die VLAN-ID im Tag ist 12 Bit lang. Damit gibt es 2<sup>12</sup> = 4.096 mögliche Werte. Nutzbar sind 1 bis 4094, weil 0 und 4095 reserviert sind.</div>
      <p>Für sehr große Umgebungen wie Rechenzentren gibt es <b>VXLAN</b>. Damit sind etwa 16,7 Millionen getrennte Netze möglich.</p>`,
    },
    {
      h: 'Kommunikation zwischen VLANs',
      html: `<p>Verschiedene VLANs sind getrennte Netze und haben meist auch eigene IP-Subnetze. Damit sie trotzdem miteinander reden können, braucht man einen <b>Router</b> oder einen <b>Layer-3-Switch</b>.</p>
      <p>Eine verbreitete Lösung ist „Router-on-a-Stick“: Ein Router hängt mit einem einzigen Trunk-Kabel am Switch. Auf dem Router gibt es für jedes VLAN ein eigenes virtuelles Interface (Subinterface) mit eigener IP-Adresse. Diese dient den Geräten im VLAN als Default-Gateway.</p>`,
    },
  ],
  questions: [
    { id: 'v1', type: 'mc', q: 'Was macht ein VLAN?', options: ['Es teilt ein physisches Netz in mehrere logische Netze auf', 'Es verbindet zwei Standorte verschlüsselt', 'Es übersetzt private in öffentliche Adressen', 'Es verstärkt das Signal'], answer: 0, explain: 'Jedes VLAN verhält sich wie ein eigener, unabhängiger Switch, obwohl alles auf derselben Hardware läuft.' },
    { id: 'v2', type: 'mc', q: 'Welcher Standard beschreibt <b>Tagged VLANs</b>?', options: ['IEEE 802.1Q', 'IEEE 802.3', 'IEEE 802.11', 'IEEE 802.1X'], answer: 0, explain: '802.1Q regelt das VLAN-Tagging. 802.3 ist Ethernet, 802.11 ist WLAN und 802.1X die Anmeldung an Ports.' },
    { id: 'v3', type: 'input', q: 'Wie viele <b>Bit</b> hat die VLAN-ID?', accept: ['12', '12 bit'], explain: 'Die VLAN-ID ist 12 Bit lang. Damit sind 2<sup>12</sup> = 4.096 Werte möglich.' },
    { id: 'v4', type: 'mc', q: 'Wo steht der VLAN-Tag im Ethernet-Frame?', options: ['Direkt nach den MAC-Adressen', 'Ganz am Ende nach der Prüfsumme', 'Im IP-Header', 'Vor der Ziel-MAC'], answer: 0, explain: 'Die Reihenfolge ist: Ziel-MAC, Quell-MAC, VLAN-Tag, Typ, Daten und am Ende die Prüfsumme.' },
    { id: 'v5', type: 'mc', q: 'Wie heißt eine Verbindung, über die <b>mehrere VLANs</b> mit Tag laufen?', options: ['Trunk', 'Access-Port', 'Uplink-Hub', 'Crossover'], answer: 0, explain: 'Ein Trunk überträgt mehrere VLANs mit Tag. Ein Access-Port gehört ohne Tag zu genau einem VLAN.' },
    { id: 'v6', type: 'mc', q: 'An einem Switch gehören Port 1 bis 4 zu VLAN 1 und Port 5 bis 8 zu VLAN 2. Ein PC steckt an Port 2, ein anderer an Port 6. Können sie direkt miteinander kommunizieren?', options: ['Nein, sie sind in verschiedenen VLANs', 'Ja, es ist derselbe Switch', 'Ja, wenn die IP-Adressen passen', 'Nur per Broadcast'], answer: 0, explain: 'Verschiedene VLANs sind getrennte Netze. Für eine Verbindung bräuchte man einen Router.' },
    { id: 'v7', type: 'mc', q: 'Zwei Switche haben je VLAN 1 und VLAN 2 und werden <b>portbasiert</b> verbunden. Wie viele Kabel braucht man zwischen ihnen?', options: ['2, eins pro VLAN', '1', '4', 'keins'], answer: 0, explain: 'Bei portbasierten VLANs braucht jedes VLAN ein eigenes Kabel. Mit einem Trunk würde eines reichen.' },
    { id: 'v8', type: 'mc', q: 'Was braucht man, damit <b>VLAN 10 und VLAN 20</b> miteinander kommunizieren können?', options: ['Einen Router oder Layer-3-Switch', 'Einen Hub', 'Einen zweiten Trunk', 'Ein Crossover-Kabel'], answer: 0, explain: 'VLANs sind getrennte Netze mit meist eigenen Subnetzen. Dazwischen muss geroutet werden, zum Beispiel über einen Router mit Subinterfaces.' },
    { id: 'v9', type: 'tf', q: 'Jedes VLAN ist eine eigene Broadcast-Domäne.', answer: true, explain: 'Broadcasts bleiben innerhalb ihres VLANs. Das ist einer der wichtigsten Vorteile.' },
    { id: 'v10', type: 'multi', q: 'Welche Vorteile bieten VLANs?', options: ['Kleinere Broadcast-Domänen', 'Abteilungen trennen, ohne neue Hardware zu kaufen', 'Mehr Sicherheit durch Trennung', 'Verschlüsselung des Datenverkehrs'], answer: [0, 1, 2], explain: 'VLANs trennen Netze logisch voneinander. Verschlüsselt wird dabei aber nichts.' },
    { id: 'v11', type: 'mc', q: 'Was ist ein <b>portbasiertes</b> VLAN?', options: ['Jeder Port gehört fest zu einem VLAN', 'Mehrere VLANs laufen über einen Port', 'Das VLAN richtet sich nach der MAC-Adresse', 'Das VLAN richtet sich nach dem Benutzernamen'], answer: 0, explain: 'Portbasiert heißt: ein VLAN pro Port. Bei Tagged VLANs können mehrere VLANs über einen Port laufen.' },
    { id: 'v12', type: 'mc', q: 'Wie viele getrennte Netze ermöglicht <b>VXLAN</b> ungefähr?', options: ['Etwa 16,7 Millionen', '4.096', '65.536', '1.024'], answer: 0, explain: 'VXLAN nutzt eine 24 Bit lange ID. 2<sup>24</sup> sind etwa 16,7 Millionen.' },
    { id: 'v13', type: 'mc', q: 'Was ist ein <b>dynamisches</b> VLAN?', options: ['Der Switch ordnet ein Gerät automatisch einem VLAN zu, zum Beispiel anhand der MAC-Adresse', 'Jeder Port wird von Hand fest einem VLAN zugeordnet', 'Ein VLAN, das nur nachts aktiv ist', 'Ein VLAN ohne VLAN-ID'], answer: 0, explain: 'Bei dynamischen VLANs hängt die Zugehörigkeit am Gerät, nicht am Port. Die feste Zuordnung von Hand heißt statisches VLAN.' },
    { id: 'v14', type: 'tf', q: 'Ein portbasiertes VLAN ist ein statisches VLAN.', answer: true, explain: 'Die Ports werden von Hand fest einem VLAN zugeordnet, und diese Zuordnung bleibt, bis jemand sie ändert.' },
  ],
  pairs: [
    { title: 'Begriffe', items: [['802.1Q', 'Standard für VLAN-Tags'], ['Trunk', 'mehrere VLANs über ein Kabel'], ['Access-Port', 'genau ein VLAN, ohne Tag'], ['VLAN-ID', '12 Bit'], ['Layer-3-Switch', 'routet zwischen VLANs'], ['VXLAN', 'etwa 16,7 Millionen Netze']] },
  ],
};
