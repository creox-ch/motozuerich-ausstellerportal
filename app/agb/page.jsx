import SiteFooter from '../site-footer';

export const metadata = {
  title: 'Ausstellungsbedingungen \u00b7 MOTO-Z\u00dcRICH 2027',
};

/**
 * Ausstellungsbedingungen MOTO-Z\u00dcRICH 2027, Fassung 1.0, g\u00fcltig ab 29. August 2026.
 * Text \u00fcbernommen aus dem intern abgestimmten Entwurf. Rechtliche Vollpr\u00fcfung
 * ausstehend \u2014 siehe docs/rechtliches-review.md.
 */
export default function AgbPage() {
  return (
    <>
      <main style={S.wrap}>
        <div style={S.entwurf}>
          <strong>Fassung 1.0 \u00b7 g\u00fcltig ab 29.08.2026.</strong> Rechtliche Vollpr\u00fcfung noch ausstehend.
        </div>
        <div className="agb-body" style={S.body} dangerouslySetInnerHTML={{ __html: AGB_HTML }} />
        <p style={S.foot}>
          <a href="/portal">Zur\u00fcck zum Ausstellerportal</a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

const S = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '40px 24px 40px' },
  entwurf: {
    border: '1px solid #B4530E',
    color: '#B4530E',
    borderRadius: 3,
    padding: '10px 12px',
    fontSize: 13,
    marginBottom: 28,
  },
  body: { fontSize: 14, lineHeight: 1.6, color: 'var(--ink, #111)' },
  foot: { marginTop: 32, fontSize: 14 },
};

const AGB_HTML = `<h1>Ausstellungsbedingungen MOTO-ZÜRICH 2027</h1>
<p><strong>Verbindliche Vertragsbedingungen für die Teilnahme als Aussteller</strong></p>
<p>Fassung 1.0 · gültig ab 29. August 2026 · MOTO-ZÜRICH 2027, 19.–21. Februar 2027, Zürich-Oerlikon</p>
<hr />
<h2>Hinweis zum Vertragsschluss</h2>
<p>Die Teilnahme an der MOTO-ZÜRICH 2027 wird ausschliesslich elektronisch über das Ausstellerportal der Veranstalterin abgewickelt. Es werden keine Verträge in Papierform mehr ausgestellt und keine handschriftlichen Unterschriften mehr eingeholt.</p>
<p>Der Vertrag zwischen der Veranstalterin und dem Aussteller kommt zustande, sobald der Aussteller diese Ausstellungsbedingungen im Ausstellerportal ausdrücklich akzeptiert und die Veranstalterin die Anmeldung bestätigt hat (siehe Ziffer 3). Die elektronische Zustimmung ist nach schweizerischem Recht rechtsgültig und der handschriftlichen Unterschrift gleichgestellt.</p>
<hr />
<h1>A. Vertragsgrundlagen</h1>
<h2>1. Veranstalterin, Veranstaltungsort und Geltungsbereich</h2>
<p><strong>1.1</strong> Veranstalterin der MOTO-ZÜRICH 2027 ist die <strong>Creox GmbH</strong>, Grabenstrasse 15b, 6340 Baar, UID CHE-169.690.018 (nachfolgend «Veranstalterin»).</p>
<p><strong>1.2</strong> Veranstaltungsort ist das Areal <strong>StageOne &amp; Halle 550</strong>, Elias-Canetti-Strasse 146, 8050 Zürich-Oerlikon.</p>
<p><strong>1.3</strong> Diese Ausstellungsbedingungen regeln abschliessend das Rechtsverhältnis zwischen der Veranstalterin und dem Aussteller im Zusammenhang mit der Teilnahme an der MOTO-ZÜRICH 2027. Sie gelten für den Aussteller, seine Mitarbeitenden, Mitaussteller sowie sämtliche von ihm beauftragten Dritten (Standbauer, Logistiker, Agenturen, Personaldienstleister).</p>
<p><strong>1.4</strong> Abweichende oder entgegenstehende Bedingungen des Ausstellers – insbesondere dessen eigene Einkaufs- oder Geschäftsbedingungen – gelten nicht, auch wenn die Veranstalterin ihnen nicht ausdrücklich widerspricht.</p>
<h2>2. Vertragsdokumente und Rangfolge</h2>
<p><strong>2.1</strong> Der Vertrag besteht aus den folgenden Dokumenten, die alle im Ausstellerportal abrufbar sind:</p>
<p>a) der Standbestätigung (Fläche, Grösse, Preis, individuelle Vereinbarungen);
b) diesen Ausstellungsbedingungen;
c) allfälligen ergänzenden Anordnungen und Weisungen der Veranstalterin gemäss Ziffer 21.</p>
<p><strong>2.2</strong> Bei Widersprüchen gilt die vorstehende Reihenfolge; die Standbestätigung geht diesen Ausstellungsbedingungen vor.</p>
<p><strong>2.3</strong> Die Veranstalterin ist berechtigt, im Einzelfall ergänzende Anordnungen und Weisungen zu erlassen und durchzusetzen, soweit dies für einen geordneten Ablauf der Veranstaltung erforderlich ist.</p>
<h2>3. Anmeldung, Zulassung und Zustandekommen des Vertrages</h2>
<p><strong>3.1 Anmeldung.</strong> Die Anmeldung erfolgt ausschliesslich elektronisch über www.motozuerich.ch bzw. das Ausstellerportal. Die ordentliche Anmeldefrist läuft bis zum <strong>31. Oktober 2026</strong>. Später eingehende Anmeldungen werden nach Massgabe der noch verfügbaren Flächen berücksichtigt.</p>
<p>Die Anmeldung ist ein verbindliches Angebot des Ausstellers. Sie bleibt verbindlich, bis die Veranstalterin über die Zulassung entschieden hat, längstens jedoch während 60 Tagen ab Eingang der Anmeldung. Mit der Standbestätigung wird der Vertrag geschlossen; ab diesem Zeitpunkt richtet sich ein Rücktritt nach Ziffer 7.</p>
<p><strong>3.2 Zulassung.</strong> Zugelassen werden Hersteller, Importeure, Händler, Dienstleister sowie weitere Aussteller, deren Produkte oder Dienstleistungen in den Rahmen der Veranstaltung passen. Die Veranstalterin entscheidet nach Prüfung der eingegangenen Anmeldungen allein über die Zulassung von Firmen, Marken und Ausstellungsobjekten. Ein Rechtsanspruch auf Zulassung besteht nicht. Ein Konkurrenzausschluss wird nicht gewährt.</p>
<p><strong>3.3 Vertragsschluss.</strong> Der Vertrag kommt zustande, sobald kumulativ:</p>
<p>a) der Aussteller im Ausstellerportal diese Ausstellungsbedingungen durch aktives Anklicken der entsprechenden Bestätigung ausdrücklich akzeptiert hat, und
b) die Veranstalterin dem Aussteller die Standbestätigung über das Ausstellerportal oder per E-Mail zugestellt hat.</p>
<p><strong>3.4 Zeichnungsberechtigung.</strong> Mit der elektronischen Zustimmung bestätigt die handelnde Person, zur rechtsverbindlichen Verpflichtung des Ausstellers befugt zu sein. Der Aussteller trägt die Verantwortung dafür, dass die Zugangsdaten zum Ausstellerportal nur befugten Personen zugänglich sind. Handlungen, die über den Zugang des Ausstellers vorgenommen werden, gelten als von diesem autorisiert.</p>
<p><strong>3.5 Dokumentation.</strong> Die Veranstalterin protokolliert Zeitpunkt, Version der akzeptierten Dokumente sowie den zugehörigen Benutzerkonto- und Verbindungsnachweis und stellt dem Aussteller unmittelbar nach Vertragsschluss eine Bestätigung per E-Mail zu, welcher die akzeptierten Dokumente als PDF beiliegen. Diese Dokumentation gilt als Nachweis des Vertragsschlusses.</p>
<p><strong>3.6 Fristablauf.</strong> Akzeptiert der Aussteller die Vertragsdokumente nicht innerhalb der im Ausstellerportal angegebenen Frist, verfällt eine allfällige Flächenreservation automatisch und ohne weitere Mitteilung.</p>
<p><strong>3.7 Richtigkeit der Angaben.</strong> Der Aussteller haftet für sämtliche Folgen, die durch ungenaue, unvollständige oder falsche Angaben bei der Anmeldung entstehen. Die Veranstalterin ist berechtigt, eine erteilte Zulassung oder Standbestätigung zu widerrufen, wenn diese aufgrund falscher Voraussetzungen oder Angaben erteilt wurde oder die Voraussetzungen nachträglich entfallen. Der Aussteller hat in diesem Fall keinen Anspruch auf Rückerstattung oder Schadenersatz.</p>
<h2>4. Standfläche, Zuteilung und Änderungsvorbehalt</h2>
<p><strong>4.1</strong> Gegenstand des Vertrages ist die Überlassung der in der Standbestätigung bezeichneten Fläche zur Nutzung während der Veranstaltung sowie der Auf- und Abbauzeiten. Vermietet wird die unmöblierte Grundfläche.</p>
<p><strong>4.2</strong> Die Zuteilung der Stände erfolgt durch die Veranstalterin. Technische, sicherheitsrelevante oder organisatorische Gründe können Änderungen der Lage, der Form oder in geringem Umfang der Grösse der Standfläche erforderlich machen. Die Veranstalterin informiert den Aussteller so früh wie möglich. Reduziert sich die Fläche wesentlich, wird die Standmiete anteilsmässig angepasst; weitergehende Ansprüche des Ausstellers bestehen nicht.</p>
<p><strong>4.3</strong> Säulen, Pfeiler, Installationsanschlüsse, Bodenöffnungen und ähnliche baulich bedingte Elemente sind Bestandteil der zugewiesenen Fläche und berechtigen nicht zu einer Preisminderung.</p>
<p><strong>4.4</strong> Die Veranstalterin behält sich vor, das Hallen- und Flächenkonzept sowie das Rahmenprogramm bis zur Veranstaltung anzupassen.</p>
<h2>5. Leistungen der Veranstalterin</h2>
<p><strong>5.1</strong> Die Veranstalterin ist verantwortlich für die Planung und Durchführung der Gesamtveranstaltung. Im Preis der Standmiete sind insbesondere enthalten:</p>
<ul>
<li>die Standfläche gemäss Standbestätigung;</li>
<li>die Aufnahme in die offizielle Ausstellerliste und den Hallenplan auf www.motozuerich.ch;</li>
<li>Werbe- und PR-Aktivitäten im Rahmen des Kommunikations- und Marketingkonzepts;</li>
<li>die Betreuung von Medien und VIP-Gästen;</li>
<li>Organisation, Durchführung und Abgeltung von Sonderflächen, Sonderausstellungen, Shows und Rahmenprogramm (u. a. Live Arena und Action Zone);</li>
<li>die allgemeine Beleuchtung, Beheizung und Grundreinigung der allgemeinen Flächen;</li>
<li>die tägliche Reinigung der Standfläche sowie die Entsorgung des im normalen Standbetrieb anfallenden Abfalls;</li>
<li>allgemeine Bewachung ausserhalb der Öffnungszeiten (ohne Obhutspflicht, siehe Ziffer 19);</li>
<li>Ausstellerausweise nach dem Kontingent gemäss Ziffer 12.3;</li>
<li>die Nachbearbeitung und Auswertung der Veranstaltung.</li>
</ul>
<p><strong>5.2</strong> Der genaue Leistungsumfang ergibt sich aus den Angaben im Ausstellerportal.</p>
<h2>6. Preise, Rechnungsstellung und Zahlungsbedingungen</h2>
<p><strong>6.1</strong> Es gelten die im Zeitpunkt des Vertragsschlusses gültigen Preise gemäss Standbestätigung. Alle Preise verstehen sich in Schweizer Franken (CHF) und exklusive der gesetzlichen Mehrwertsteuer.</p>
<p><strong>6.2 Zahlung.</strong> Die Standmiete wird nach Vertragsschluss vollständig in Rechnung gestellt. Sie ist innert 30 Tagen ab Rechnungsstellung zu bezahlen, spätestens jedoch bis zum <strong>15. Dezember 2026</strong>; massgebend ist der frühere der beiden Termine. Kommt der Vertrag so spät zustande, dass diese Frist nicht mehr eingehalten werden kann, ist der Betrag innert 10 Tagen ab Rechnungsstellung und in jedem Fall vor Beginn des Aufbaus zu bezahlen. Abweichende Zahlungspläne können in der Standbestätigung vereinbart werden.</p>
<p><strong>6.3 Zusatzleistungen.</strong> Zusatzleistungen und Extras (Mietmobiliar, Trennwände, zusätzliche Strom-, Wasser- und Netzwerkanschlüsse, Standreinigung, Standbau, Personal, Werbeleistungen usw.) werden ausschliesslich über das Ausstellerportal bestellt, innerhalb der dort genannten Fristen. Bestellungen nach Fristablauf können mit einem Zuschlag belastet werden.</p>
<p>Massgebend ist der im Ausstellerportal im Zeitpunkt der Bestellung angezeigte Preis. Mit dem Absenden der Bestellung wird dieser Preis verbindlich; der Aussteller erhält eine Bestellbestätigung mit Leistung und Preis. Zusatzleistungen werden separat durch die Veranstalterin oder die beauftragten Lieferanten in Rechnung gestellt und bilden Bestandteil des Vertrages.</p>
<p><strong>6.4 Verzug.</strong> Bei Zahlungsverzug ist die Veranstalterin ohne weitere Mahnung berechtigt, einen Verzugszins von 5 % p. a. sowie eine Mahngebühr von CHF 50.– je Mahnung zu erheben.</p>
<p><strong>6.5 Zutrittsverweigerung.</strong> Voraussetzung für den Bezug der Standfläche und den Beginn des Standaufbaus ist die vollständige Bezahlung aller bis dahin fälligen Beträge. Die Veranstalterin ist berechtigt, dem Aussteller bei ausstehenden Zahlungen den Zugang zur Fläche zu verweigern, die Fläche anderweitig zu vergeben und vom Vertrag zurückzutreten. Der Anspruch auf die volle Vertragssumme bleibt in diesem Fall bestehen.</p>
<p><strong>6.6 Verrechnung.</strong> Die Verrechnung von Forderungen des Ausstellers mit Forderungen der Veranstalterin ist ausgeschlossen, es sei denn, die Gegenforderung sei anerkannt oder gerichtlich festgestellt.</p>
<h2>7. Rücktritt, Storno und Nichtteilnahme</h2>
<p><strong>7.1</strong> Ein Rücktritt des Ausstellers ist nur schriftlich (E-Mail genügt) und ausschliesslich über das Ausstellerportal oder an die dort genannte Adresse möglich. Massgebend ist der Eingang bei der Veranstalterin.</p>
<p><strong>7.2 Stornostaffel.</strong> Tritt der Aussteller nach Vertragsschluss zurück, schuldet er der Veranstalterin folgende Entschädigung auf der vereinbarten Standmiete:</p>
<table>
<thead>
<tr>
<th>Eingang der Rücktrittserklärung</th>
<th>Geschuldete Entschädigung</th>
</tr>
</thead>
<tbody>
<tr>
<td>bis 31. Oktober 2026</td>
<td>25 %</td>
</tr>
<tr>
<td>1. November 2026 bis 31. Dezember 2026</td>
<td>50 %</td>
</tr>
<tr>
<td>1. Januar 2027 bis 31. Januar 2027</td>
<td>75 %</td>
</tr>
<tr>
<td>ab 1. Februar 2027 sowie bei Nichterscheinen</td>
<td>100 %</td>
</tr>
</tbody>
</table>
<p><strong>7.3</strong> Gelingt es der Veranstalterin, die Fläche zu gleichwertigen Bedingungen anderweitig zu vermieten, reduziert sich die Entschädigung auf 25 % der Standmiete, mindestens jedoch CHF 1'000.– (exkl. MwSt.) als Umtriebsentschädigung.</p>
<p><strong>7.4</strong> Bereits bestellte Zusatzleistungen und Extras sind in jedem Fall vollumfänglich geschuldet, soweit sie von der Veranstalterin oder ihren Lieferanten nicht mehr kostenfrei storniert werden können.</p>
<p><strong>7.5</strong> Ein Stand, der am Eröffnungstag um 08:30 Uhr nicht bezogen ist, gilt als nicht in Anspruch genommen. Die Veranstalterin kann die Fläche anderweitig vergeben oder bespielen – unter voller Wahrung des Anspruchs auf die gesamte Vertragssumme.</p>
<h2>8. Untervermietung, Mitaussteller und vertretene Marken</h2>
<p><strong>8.1</strong> Die Untervermietung, der Tausch oder die entgeltliche wie unentgeltliche Weitergabe der Standfläche an Dritte ist ohne vorgängige schriftliche Zustimmung der Veranstalterin untersagt.</p>
<p><strong>8.2</strong> Mitaussteller sowie zusätzlich vertretene Marken sind der Veranstalterin vorgängig über das Ausstellerportal zu melden und bedürfen ihrer Zulassung. Für Mitaussteller kann eine Gebühr nach dem im Ausstellerportal angezeigten Ansatz erhoben werden.</p>
<p><strong>8.3</strong> Der Aussteller haftet für das Verhalten seiner Mitaussteller sowie sämtlicher von ihm beauftragter Dritter wie für sein eigenes.</p>
<p><strong>8.4</strong> Bei unbewilligter Untervermietung oder unbewilligter Präsenz Dritter ist die Veranstalterin berechtigt, die betreffende Präsenz sofort zu unterbinden und eine Konventionalstrafe in der Höhe von 50 % der Standmiete zu erheben. Weitergehender Schadenersatz bleibt vorbehalten.</p>
<hr />
<h1>B. Auftritt und Standbetrieb</h1>
<h2>9. Qualität der Präsentation</h2>
<p><strong>9.1</strong> Von allen Ausstellern wird eine ansprechende, gepflegte und dem hochwertigen Charakter der Veranstaltung entsprechende Präsentation erwartet. Sowohl der Standbau als auch die Produktdarstellung sollen ein professionelles Gesamtbild vermitteln. Ein ungepflegter oder unprofessioneller Auftritt wird nicht akzeptiert.</p>
<p><strong>9.2</strong> Die Veranstalterin ist berechtigt, vor der Veranstaltung Standbau- und Präsentationskonzepte einzufordern und bei Bedarf Anpassungen zu verlangen, um ein einheitlich hochwertiges Erscheinungsbild sicherzustellen. Entspricht ein Stand den Anforderungen offensichtlich nicht, kann die Veranstalterin nach erfolgloser Aufforderung auf Kosten des Ausstellers die notwendigen Anpassungen vornehmen lassen.</p>
<h2>10. Standkonzeption, Standeinrichtung und Aufbauhöhen</h2>
<p><strong>10.1</strong> Die Stände sind so zu gestalten, dass ein offenes und einladendes Gesamtbild der Veranstaltung entsteht. Geschlossene Wände gegen die Besuchergänge sind nicht zulässig.</p>
<p><strong>10.2 Maximale Bauhöhe.</strong> Die maximale Bauhöhe beträgt in allen Bereichen <strong>2.50 m</strong>. Höhere Aufbauten, abgehängte Elemente, Traversen und Sonderkonstruktionen sind nur mit vorgängiger schriftlicher Zustimmung der Veranstalterin und nach Einreichung der Baupläne zulässig.</p>
<p><strong>10.2bis</strong> Zu Sprinklerdüsen und Rauchmeldern ist ein Abstand von mindestens 30 cm horizontal und 50 cm vertikal einzuhalten. Aufbauten dürfen die Wirkung der Sprinkleranlage und der Brandmeldeanlage nicht beeinträchtigen; Rauchmelder dürfen weder überbaut noch abgedeckt werden.</p>
<p><strong>10.3</strong> Jeder Aussteller ist für Standbau, Ausstattung und Rückbau selbst verantwortlich. Die Veranstalterin stellt lediglich die Grundfläche zur Verfügung.</p>
<p><strong>10.4</strong> Standbauten müssen den feuerpolizeilichen Vorschriften entsprechen und aus schwer brennbaren oder feuerfesten Materialien bestehen. Explosivstoffe und gefährliche Stoffe sind ausgeschlossen.</p>
<p><strong>10.5</strong> Für 2027 gilt ein einheitliches Lichtkonzept über alle Flächen. Eigene Beleuchtungskonstruktionen sind vorgängig mit der Veranstalterin abzustimmen.</p>
<p><strong>10.6 Elektroinstallationen.</strong> Sämtliche elektrischen Installationen dürfen ausschliesslich durch die von der Veranstalterin beauftragten Partnerfirmen ausgeführt werden. Dies gilt für die gesamte Installation auf der Standfläche, namentlich für Zuleitung, Unterverteilung, Verkabelung sowie für die Montage und den Anschluss von Standbeleuchtung, Traversen und fest installierten Geräten.</p>
<p>Dem Aussteller ist es nicht gestattet, elektrische Installationen selbst oder durch eigene Standbauer, Elektriker oder sonstige Dritte ausführen zu lassen. Zulässig bleibt der Anschluss betriebsfertiger Geräte mit Stecker an die bereitgestellten Steckdosen.</p>
<p>Der Bedarf an Anschlüssen und Standbeleuchtung ist innerhalb der im Ausstellerportal genannten Frist über das entsprechende Bestellformular anzumelden. Die Leistungen werden dem Aussteller zu den bei der Bestellung angezeigten Preisen verrechnet. Nicht fristgerecht angemeldete Anschlüsse können nur nach Verfügbarkeit und gegen Zuschlag erstellt werden.</p>
<p>Nicht bewilligte oder durch Dritte ausgeführte Installationen werden auf Kosten des Ausstellers zurückgebaut oder vom Netz genommen. Ein Anspruch auf Entschädigung besteht nicht.</p>
<p><strong>10.7</strong> Das Anbringen von Befestigungen, Bohrungen, Klebungen oder Anstrichen an Böden, Wänden, Säulen, Decken oder Einrichtungen des Veranstaltungsortes ist untersagt. Für Beschädigungen haftet der Aussteller vollumfänglich.</p>
<h2>11. Auf- und Abbau, Anlieferung</h2>
<p><strong>11.1</strong> Die Zeiten für Auf- und Abbau sowie die Anlieferungsfenster sind je nach Halle unterschiedlich und werden den Ausstellern rechtzeitig über das Ausstellerportal mitgeteilt und sind verbindlich einzuhalten. Der Aufbau darf den Gesamtaufbau nicht behindern.</p>
<p><strong>11.2</strong> Alle Stände müssen bis spätestens <strong>Freitag, 19. Februar 2027, 08:30 Uhr</strong> vollständig fertiggestellt und präsentationsbereit sein. Verpackungs- und Transportmaterial ist bis zu diesem Zeitpunkt aus den Hallen zu entfernen; eine Lagerung hinter dem Stand oder in Gängen ist nicht gestattet.</p>
<p><strong>11.3</strong> Der Transport von Waren in die und aus den Hallen während der Öffnungszeiten ist untersagt.</p>
<p><strong>11.4</strong> Mit dem Abbau darf am Schlusstag nicht vor dem offiziellen Ende der Veranstaltung begonnen werden.</p>
<p><strong>11.5</strong> Das Ausräumen der Stände ist Sache der Aussteller; der Abtransport hat gemäss Abbauplan zu erfolgen. Die Fläche ist im ursprünglichen Zustand zurückzugeben. Nicht rechtzeitig abgeholte Materialien oder Gegenstände können von der Veranstalterin auf Kosten und Risiko des Ausstellers entfernt und eingelagert oder entsorgt werden.</p>
<p><strong>11.6</strong> Während der Abbauzeit sowie beim Kassenschluss am letzten Veranstaltungstag ist besondere Sorgfalt geboten, da in dieser Zeit ein erhöhtes Risiko für Verluste und Diebstahl besteht.</p>
<h2>12. Öffnungszeiten, Betriebspflicht und Ausstellerausweise</h2>
<p><strong>12.1</strong> Die MOTO-ZÜRICH 2027 findet vom <strong>19. bis 21. Februar 2027</strong> in Zürich-Oerlikon (StageOne &amp; Halle 550) statt. Die genauen Öffnungszeiten legt die Veranstalterin fest und publiziert sie auf der offiziellen Website.</p>
<p><strong>12.2 Betriebspflicht.</strong> Der Aussteller ist verpflichtet, seinen Stand während der gesamten Öffnungszeiten ununterbrochen zu besetzen und in einwandfreiem Zustand zu betreiben. Ausstellungsgüter dürfen während der Öffnungszeiten nicht abgedeckt oder entfernt werden.</p>
<p><strong>12.3 Ausstellerausweise.</strong> Im Preis der Standmiete ist das folgende Kontingent an Ausstellerausweisen enthalten:</p>
<table>
<thead>
<tr>
<th>Standfläche</th>
<th>Kontingent</th>
</tr>
</thead>
<tbody>
<tr>
<td>bis 10 m²</td>
<td>2</td>
</tr>
<tr>
<td>11–35 m²</td>
<td>3</td>
</tr>
<tr>
<td>36–55 m²</td>
<td>6</td>
</tr>
<tr>
<td>56–89 m²</td>
<td>8</td>
</tr>
<tr>
<td>90–129 m²</td>
<td>15</td>
</tr>
</tbody>
</table>
<p>Für Standflächen ab 130 m² wird das Kontingent in der Standbestätigung festgelegt.</p>
<p>Zusätzliche Ausweise können über das Ausstellerportal zum dort angezeigten Preis bezogen werden.</p>
<p><strong>12.4</strong> Aussteller mit gültigen Ausstellerausweisen haben Zutritt zu ihren Ständen jeweils eine Stunde vor der offiziellen Öffnung und bis 30 Minuten nach Schliessung. Die Ausweise sind persönlich, nicht übertragbar und auf Verlangen vorzuweisen. Missbräuchlich verwendete Ausweise werden entschädigungslos eingezogen.</p>
<h2>13. Preisanschrift und Verkaufsgrundsätze</h2>
<p><strong>13.1</strong> Die Aussteller sind in ihrer Preispolitik grundsätzlich frei, haben sich jedoch an die Regeln des lauteren Wettbewerbs und die einschlägigen Vorschriften (insbesondere die Preisbekanntgabeverordnung) zu halten.</p>
<p><strong>13.2</strong> Alle ausgestellten Produkte und Dienstleistungen, die zum Verkauf angeboten werden, müssen mit klaren und gut lesbaren Preisangaben in Schweizer Franken (CHF) inklusive Mehrwertsteuer versehen sein.</p>
<p><strong>13.3</strong> Unlautere Wettbewerbsmethoden, irreführende Preisangaben sowie aufdringliche Ansprache von Besuchern ausserhalb der eigenen Standfläche sind untersagt. Werbe- und Verkaufstätigkeit ist auf die zugewiesene Standfläche beschränkt; das Verteilen von Werbematerial in den Gängen, auf Parkplätzen oder ausserhalb des Standes bedarf der schriftlichen Zustimmung der Veranstalterin.</p>
<p><strong>13.4 Speisen und Getränke.</strong> Der <strong>Verkauf</strong> von Speisen und Getränken jeglicher Art durch den Aussteller ist untersagt. Das Gastronomieangebot der Veranstaltung ist ausschliesslich der Veranstalterin und ihren Cateringpartnern vorbehalten.</p>
<p>Die <strong>kostenlose Abgabe</strong> von Speisen und Getränken an Standbesucher in üblichem Umfang ist gestattet, sofern die lebensmittelrechtlichen Vorschriften eingehalten werden. Der Aussteller ist für die Einhaltung der Hygiene-, Kühl-, Deklarations- und Selbstkontrollvorschriften selbst verantwortlich und stellt die Veranstalterin von behördlichen Beanstandungen frei.</p>
<p>Die Veranstalterin kann für die Abgabe von Speisen und Getränken Auflagen erlassen und die Abgabe bei Verstössen untersagen. Catering für den eigenen Stand (Standbewirtung, Personalverpflegung, Kundenanlässe) ist über die von der Veranstalterin bezeichneten Cateringpartner zu beziehen.</p>
<h2>14. Lärm, Musik und Urheberrechte</h2>
<p><strong>14.1</strong> Aktionen oder Präsentationen, die zu übermässigen Lärmemissionen führen, sind nur mit vorgängiger Zustimmung der Veranstalterin erlaubt. Bildschirme und audiovisuelle Präsentationen sind so auszurichten, dass Nachbarstände nicht gestört werden und sich Besucher innerhalb des Standes aufhalten können.</p>
<p><strong>14.2</strong> Die Veranstalterin kann Höchstwerte für die Lautstärke festlegen und deren Einhaltung kontrollieren. Bei Nichteinhaltung ist sie berechtigt, die Beschallung nach erfolgloser Ermahnung zu unterbinden.</p>
<p><strong>14.3</strong> Für die öffentliche Wiedergabe von Musik oder anderen geschützten Werken am Stand ist der Aussteller selbst verantwortlich. Die erforderlichen Bewilligungen und Abgaben (insbesondere SUISA) sind vom Aussteller auf eigene Kosten einzuholen bzw. zu entrichten. Der Aussteller stellt die Veranstalterin von diesbezüglichen Ansprüchen Dritter vollumfänglich frei.</p>
<p><strong>14.4</strong> Der Aussteller stellt sicher, dass er über alle notwendigen Rechte an den von ihm gezeigten Marken, Bildern, Filmen und Inhalten verfügt.</p>
<h2>15. Fahrzeuge, Vorführungen und Testfahrten</h2>
<p><strong>15.1</strong> Das Starten oder Betreiben von Motoren innerhalb der Hallen ist untersagt.</p>
<p><strong>15.2</strong> Ausgestellte Motorräder und Fahrzeuge dürfen keinen vollen Tank enthalten; der Tank ist so weit wie möglich zu entleeren. Die Veranstalterin kann zusätzliche Auflagen (z. B. Auffangwannen, Tankverschluss) anordnen.</p>
<p><strong>15.3</strong> Das <strong>Laden von Batterien und Akkus jeglicher Art – insbesondere von Lithium-Ionen-Batterien, E-Bikes und E-Motorrädern – ist in den Hallen und auf dem gesamten Veranstaltungsgelände untersagt.</strong></p>
<p><strong>15.4</strong> Vorführungen, Testfahrten, Probefahrten und Aktivitäten in der Action Zone oder in der Live Arena bedürfen einer gesonderten Vereinbarung mit der Veranstalterin. Der Aussteller stellt dabei sicher, dass alle sicherheits-, verkehrs- und versicherungsrechtlichen Vorgaben eingehalten werden, insbesondere ausreichender Versicherungsschutz, Fahrerlaubnis, Schutzausrüstung und Aufsicht. Der Aussteller haftet für sämtliche Schäden aus solchen Aktivitäten.</p>
<h2>16. Technische und feuerpolizeiliche Sicherheitsmassnahmen</h2>
<p><strong>16.1</strong> Alle elektrischen Geräte und Installationen der Aussteller müssen den geltenden Vorschriften entsprechen – insbesondere der Niederspannungs-Installationsnorm (NIN 7.11.6) für temporär errichtete Anlagen – und einwandfrei funktionieren. Sämtliche Geräte sind über einen Fehlerstromschutzschalter (FI/RCD) zu betreiben. Defekte oder nicht vorschriftskonforme Geräte und Installationen können von der Veranstalterin entfernt oder gesperrt werden.</p>
<p><strong>16.1bis</strong> Temporäre elektrische Anlagen unterliegen der Prüfpflicht nach Art. 24 NIV (baubegleitende Erstprüfung und Schlusskontrolle durch ein Kontrollorgan). Die Veranstalterin organisiert diese Kontrollen über die von ihr beauftragten Partnerfirmen; die Installationsarbeiten selbst richten sich nach Ziffer 10.6. Der Aussteller hält seine Fläche und die von ihm angeschlossenen Geräte zum angekündigten Zeitpunkt zugänglich und prüfbereit. Werden Mängel an mitgebrachten Geräten festgestellt, sind diese unverzüglich auf Kosten des Ausstellers zu beheben; andernfalls kann das betroffene Gerät bis zur Behebung vom Netz genommen werden. Ein Anspruch auf Entschädigung besteht nicht.</p>
<p><strong>16.2</strong> Die Lagerung und Aufbewahrung von feuergefährlichen, explosiven oder leicht brennbaren Stoffen (z. B. Benzin, Treibstoff, Butangas) ist verboten.</p>
<p><strong>16.3</strong> Dekorationen und Standmaterialien müssen mindestens der <strong>Brandkennziffer V2 (schwer entflammbar)</strong> entsprechen. Brennbare Dekorationen sowie Ballone, die mit brennbaren oder giftigen Gasen gefüllt sind, sind nicht erlaubt.</p>
<p><strong>16.4</strong> Feuermelder, Wandhydranten, Handfeuerlöscher, Notausgänge, Treppen, Gänge und Fluchtwege dürfen nicht verstellt oder verdeckt werden und müssen jederzeit frei zugänglich sein. Zwischen den Ständen ist in jedem Fall eine <strong>Fluchtwegbreite von 2.50 m</strong> einzuhalten.</p>
<p><strong>16.5</strong> Den Anordnungen der Feuerpolizei, der Sicherheitsorgane und des Sicherheitsdienstes der Veranstalterin ist unverzüglich Folge zu leisten.</p>
<h2>17. Reinigung, Abfall und Nachhaltigkeit</h2>
<p><strong>17.1</strong> Die allgemeine Reinigung der Gänge, Sanitäranlagen und allgemeinen Flächen organisiert die Veranstalterin.</p>
<p><strong>17.2 Standreinigung.</strong> Die <strong>tägliche Reinigung der Standfläche ist im Flächenpreis inbegriffen</strong> und wird durch die von der Veranstalterin beauftragten Partner ausgeführt. Sie erfolgt ausserhalb der Öffnungszeiten. Der Aussteller hält die Fläche dafür zugänglich; Wertgegenstände, lose Unterlagen und empfindliche Ausstellungsgüter sind vorher zu sichern. Für Schäden an nicht gesicherten Gegenständen wird keine Haftung übernommen.</p>
<p>Zusätzliche Leistungen – Sonderreinigungen, Teppich- und Polsterreinigung, Reinigung während der Öffnungszeiten oder Reinigung nach besonderer Verschmutzung – können über das entsprechende Formular im Ausstellerportal kostenpflichtig bestellt werden. Reinigungsleistungen dürfen ausschliesslich über die von der Veranstalterin bezeichneten Partner bezogen werden.</p>
<p><strong>17.3 Abfallentsorgung.</strong> Die Entsorgung des im normalen Standbetrieb anfallenden Abfalls ist im Flächenpreis inbegriffen.</p>
<p>Nicht inbegriffen und vom Aussteller auf eigene Kosten zu entsorgen sind insbesondere: Standbau-, Verpackungs- und Dekorationsmaterial, Paletten und Sperrgut, Elektro- und Sonderabfälle (namentlich Öle, Betriebs- und Treibstoffe, Batterien und Akkus) sowie Abfall aus der Abgabe von Speisen und Getränken in grösserem Umfang. Die Entsorgung solcher Abfälle kann kostenpflichtig über die Veranstalterin bestellt werden.</p>
<p>Nach Ende des Abbaus liegengelassene Materialien und Abfälle werden nach Aufwand weiterverrechnet.</p>
<hr />
<h1>C. Haftung, Versicherung und Risiken</h1>
<h2>18. Haftung des Ausstellers und Versicherungen</h2>
<p><strong>18.1</strong> Der Aussteller haftet für alle Schäden, die er selbst, seine Mitarbeitenden, Mitaussteller oder von ihm beauftragte Dritte an anderen Ständen, am Eigentum der Veranstalterin, am Veranstaltungsort oder an Leben, Körper und Eigentum Dritter verursachen.</p>
<p><strong>18.2</strong> Der Aussteller ist verpflichtet, für die Dauer der Veranstaltung einschliesslich Auf- und Abbau über eine gültige <strong>Betriebshaftpflichtversicherung</strong> mit einer Deckungssumme von mindestens <strong>CHF 5 Mio.</strong> zu verfügen, welche die Risiken der Veranstaltungsteilnahme einschliesst. Die Veranstalterin kann jederzeit einen entsprechenden Nachweis verlangen. Wird dieser nicht erbracht, kann sie den Zutritt zur Fläche verweigern.</p>
<p><strong>18.3</strong> Es wird dringend empfohlen, die Ausstellungsgüter während der gesamten Dauer der Veranstaltung einschliesslich Auf- und Abbau und Transport gegen Feuer- und Elementarschäden, Diebstahl, Einbruch und Beschädigung zu versichern.</p>
<p><strong>18.4</strong> Für die Folgen einer gesetzlichen Haftung hat der Aussteller selbst aufzukommen, auch wenn er keine entsprechende Versicherung abgeschlossen hat.</p>
<h2>19. Haftungsausschluss der Veranstalterin</h2>
<p><strong>19.1</strong> Die Veranstalterin ist für ihre gesetzliche Haftung versichert. Eine Obhutspflicht für Ausstellungsgüter, Fahrzeuge, Standeinrichtungen oder sonstige Gegenstände der Aussteller besteht nicht. Jegliche Haftung für Schäden, Verlust oder Abhandenkommen wird – soweit gesetzlich zulässig – ausgeschlossen.</p>
<p><strong>19.2</strong> Der Haftungsausschluss gilt ausdrücklich auch während des Transports der Güter in die Hallen, während des Auf- und Abbaus sowie beim Rücktransport.</p>
<p><strong>19.3</strong> Die Veranstalterin haftet nicht für entgangenen Gewinn, ausgebliebene Besucherzahlen, Betriebsunterbrüche, Ausfälle der Strom-, Wasser- oder Netzwerkversorgung oder für Leistungen von Drittlieferanten.</p>
<p><strong>19.4</strong> Die von der Veranstalterin getroffenen Bewachungsmassnahmen führen zu keiner Einschränkung dieses Haftungsausschlusses.</p>
<p><strong>19.5</strong> Der Aussteller weist sein Standpersonal auf die Sorgfalts- und Obhutspflicht hin. Ausstellungsgüter sind ausserhalb der Öffnungszeiten ausreichend zu sichern (abdecken oder verschliessen); besonders wertvolle und leicht transportable Gegenstände sind über Nacht zu entfernen.</p>
<p><strong>19.6</strong> Vorbehalten bleibt die Haftung der Veranstalterin für Personenschäden sowie für Schäden aus grobfahrlässigem oder absichtlichem Verhalten.</p>
<h2>20. Höhere Gewalt</h2>
<p><strong>20.1</strong> Kann die Veranstaltung aus Gründen ausserhalb des Einflussbereichs der Veranstalterin – namentlich behördlicher Anordnungen, Epidemien und Pandemien, Naturereignissen, Feuer, Krieg, Terror, Streik, Energiemangellage oder Ausfall des Veranstaltungsortes – nicht wie geplant durchgeführt werden, ist die Veranstalterin berechtigt, sie zu kürzen, zu verlängern oder abzusagen. Sie informiert die Aussteller so rasch wie möglich.</p>
<p><strong>20.2</strong> Wird die Veranstaltung gekürzt oder verlängert, bleibt der Vertrag unverändert bestehen; ein Anspruch auf Herabsetzung der Standmiete oder auf Rückerstattung besteht nicht. Dasselbe gilt, wenn die Veranstaltung nach ihrer Eröffnung unterbrochen oder verkürzt werden muss.</p>
<p><strong>20.3</strong> Wird die Veranstaltung abgesagt, werden von der Standmiete die der Veranstalterin entstandenen und nicht mehr abwendbaren Kosten anteilsmässig abgezogen, der Rest wird zurückerstattet. Die Veranstalterin ist verpflichtet, diese Kosten so weit als möglich zu reduzieren. Der Aussteller schuldet in keinem Fall mehr als die vereinbarte Standmiete. Bereits bezogene Zusatzleistungen bleiben geschuldet, soweit sie nicht mehr kostenfrei storniert werden können.</p>
<p><strong>20.4</strong> Ein Anspruch auf Schadenersatz besteht in keinem Fall.</p>
<hr />
<h1>D. Allgemeine Bestimmungen</h1>
<h2>21. Hausrecht und Massnahmen für einen geordneten Betrieb</h2>
<p><strong>21.1</strong> Die Veranstalterin übt auf dem gesamten Gelände der Veranstaltung während Aufbau, Durchführung und Abbau das Hausrecht aus. Sie ist berechtigt, Weisungen an Aussteller, deren Angestellte oder beauftragte Dritte zu erteilen.</p>
<p><strong>21.2</strong> Die Veranstalterin ist berechtigt, alle notwendigen Massnahmen zu ergreifen, um einen geordneten Ablauf der Veranstaltung sicherzustellen.</p>
<p><strong>21.3</strong> Bei Nichteinhaltung der Vorschriften kann die Veranstalterin auf Kosten und Risiko des Ausstellers die erforderlichen Schritte selbst veranlassen oder nach erfolgloser Ermahnung den Stand schliessen und den Aussteller von der Veranstaltung ausschliessen.</p>
<p><strong>21.4</strong> Dem betroffenen Aussteller entsteht daraus kein Anspruch auf Rückzahlung von Standmieten, Gebühren, Extras oder auf Schadenersatz. Die Veranstalterin behält sich vor, den Aussteller von künftigen Ausgaben auszuschliessen.</p>
<h2>22. Bild-, Ton- und Medienrechte</h2>
<p><strong>22.1</strong> Die Veranstalterin ist berechtigt, während der Veranstaltung Bild-, Film- und Tonaufnahmen der Stände, der Ausstellungsgüter und der anwesenden Personen anfertigen zu lassen und diese zeitlich und örtlich unbeschränkt für die Dokumentation, Berichterstattung sowie für Werbe- und Marketingzwecke der MOTO-ZÜRICH zu nutzen. Der Aussteller erteilt hierzu seine Zustimmung und stellt sicher, dass sein Personal informiert ist.</p>
<p><strong>22.2</strong> Der Aussteller räumt der Veranstalterin das Recht ein, seine Firmenbezeichnung, sein Logo und eine kurze Firmenbeschreibung für die Ausstellerliste, den Hallenplan, den Event Guide und die Kommunikation der Veranstaltung zu verwenden.</p>
<p><strong>22.3</strong> Der Aussteller darf die Marke «MOTO-ZÜRICH» sowie das zugehörige Logo im Zusammenhang mit seiner Teilnahme nach Massgabe der von der Veranstalterin bereitgestellten Vorlagen verwenden. Eine darüber hinausgehende Nutzung bedarf der schriftlichen Zustimmung.</p>
<h2>23. Datenschutz</h2>
<p><strong>23.1</strong> Die Veranstalterin bearbeitet Personen- und Firmendaten des Ausstellers nach Massgabe des schweizerischen Datenschutzgesetzes (DSG) und, soweit anwendbar, der DSGVO.</p>
<p><strong>23.2</strong> Die Bearbeitung erfolgt, soweit dies für die Organisation, Durchführung, Abrechnung und Nachbearbeitung der MOTO-ZÜRICH sowie für die Information über künftige Ausgaben erforderlich ist.</p>
<p><strong>23.3</strong> Eine Weitergabe der Daten an Dritte erfolgt ausschliesslich, soweit dies für die Erbringung von Leistungen im Zusammenhang mit der Veranstaltung notwendig ist (z. B. Standbau, Technik, Logistik, Ticketing, Sicherheitsdienst, IT-Dienstleister des Ausstellerportals).</p>
<p><strong>23.4</strong> Firmenname, Marken, Standnummer und öffentliche Kontaktangaben werden im Rahmen der Ausstellerliste, des Hallenplans und der Kommunikation veröffentlicht.</p>
<p><strong>23.5</strong> Der Aussteller ist selbst dafür verantwortlich, dass die von ihm am Stand erhobenen Besucherdaten datenschutzkonform bearbeitet werden.</p>
<p><strong>23.6</strong> Einzelheiten regelt die Datenschutzerklärung auf www.motozuerich.ch.</p>
<h2>24. Ausstellerportal und Kommunikation</h2>
<p><strong>24.1</strong> Die gesamte Kommunikation zwischen der Veranstalterin und dem Aussteller erfolgt über das Ausstellerportal und die vom Aussteller hinterlegte E-Mail-Adresse. Mitteilungen gelten mit Zustellung an diese Adresse bzw. mit Bereitstellung im Ausstellerportal als zugegangen.</p>
<p><strong>24.2</strong> Der Aussteller ist verpflichtet, seine Kontakt- und Firmendaten im Ausstellerportal aktuell zu halten und die dort publizierten Weisungen und Fristen zu beachten.</p>
<p><strong>24.3</strong> Die Schriftform gilt auch durch E-Mail oder Bestätigung im Ausstellerportal als gewahrt.</p>
<h2>25. Änderungen dieser Ausstellungsbedingungen</h2>
<p><strong>25.1</strong> Die Veranstalterin behält sich vor, diese Ausstellungsbedingungen anzupassen, soweit dies aufgrund behördlicher Auflagen, sicherheitsrelevanter Anforderungen oder organisatorischer Notwendigkeiten erforderlich ist.</p>
<p><strong>25.2</strong> Änderungen werden dem Aussteller über das Ausstellerportal und per E-Mail mitgeteilt. Beeinträchtigen sie die Rechte des Ausstellers wesentlich, kann dieser innert 14 Tagen ab Mitteilung schriftlich vom Vertrag zurücktreten; bereits geleistete Zahlungen werden in diesem Fall zurückerstattet. Erfolgt kein Rücktritt, gelten die Änderungen als angenommen.</p>
<p><strong>25.3</strong> Massgebend ist die im Zeitpunkt des Vertragsschlusses akzeptierte Fassung, vorbehältlich Änderungen nach dieser Ziffer.</p>
<h2>26. Schlussbestimmungen</h2>
<p><strong>26.1 Teilnichtigkeit.</strong> Sollte eine Bestimmung dieser Ausstellungsbedingungen ganz oder teilweise unwirksam sein, bleibt die Gültigkeit der übrigen Bestimmungen unberührt. Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck am nächsten kommt.</p>
<p><strong>26.2 Anwendbares Recht.</strong> Es gilt ausschliesslich schweizerisches Recht unter Ausschluss des Kollisionsrechts und des UN-Kaufrechts.</p>
<p><strong>26.3 Gerichtsstand.</strong> Ausschliesslicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist <strong>Zug</strong>.</p>
<h2>27. Anerkennung der Teilnahmebedingungen</h2>
<p><strong>27.1</strong> Mit der elektronischen Zustimmung im Ausstellerportal anerkennt der Aussteller diese Ausstellungsbedingungen für sich sowie für seine Angestellten, Mitaussteller und beauftragten Dritten als verbindlich und verpflichtet sich, sie in allen Teilen einzuhalten.</p>
<p><strong>27.2</strong> Der Aussteller bestätigt zudem, die aktuellen Informationen zu Leistungen, Preisen, Öffnungszeiten und organisatorischen Abläufen im Ausstellerportal zur Kenntnis genommen zu haben.</p>
<hr />`;
