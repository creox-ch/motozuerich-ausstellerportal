import SiteFooter from '../site-footer';

export const metadata = {
  title: 'Datenschutzerklärung · Ausstellerportal MOTO-ZÜRICH 2027',
};

/**
 * ⚠️ ЧЕРНОВИК. Текст описывает фактическую обработку данных так, как она
 * реализована в коде, но юридической проверки не проходил. До проверки
 * страница не должна быть связана ссылками с основным сайтом.
 *
 * Что нужно от людей: подтвердить контролёра и его адрес, срок хранения
 * и порядок удаления, проверить формулировки у юриста.
 */
export default function DatenschutzPage() {
  return (
    <>
      <main style={S.wrap}>
      <div style={S.entwurf}>
        <strong>Entwurf.</strong> Diese Fassung beschreibt die tatsächliche Verarbeitung,
        ist aber rechtlich noch nicht geprüft.
      </div>

      <h1 style={S.h1}>Datenschutzerklärung</h1>
      <p style={S.lead}>
        Für das Ausstellerportal der MOTO-ZÜRICH 2027 und die Standanfrage über den
        Hallenplan.
      </p>

      <h2 style={S.h2}>Verantwortlich</h2>
      <p style={S.p}>
        Creox GmbH, Grabenstrasse 15b, 6340 Baar (ZG), Schweiz.
        <br />
        Kontakt für Datenschutzanliegen:{' '}
        <a href="mailto:team@motozuerich.ch">team@motozuerich.ch</a>
      </p>

      <h2 style={S.h2}>Welche Daten wir bearbeiten</h2>
      <ul style={S.ul}>
        <li>
          <b>Standanfrage:</b> Firma, Ansprechperson, E-Mail-Adresse, Telefonnummer,
          Nachricht, gewählte Fläche sowie Herkunft des Aufrufs (Adresse der Seite und
          Kampagnenparameter).
        </li>
        <li>
          <b>Ausstellerkonto:</b> E-Mail-Adresse für die Anmeldung, Firmendaten für Vertrag
          und Rechnung, Angaben für den Verzeichniseintrag samt Logo, Zeitpunkte der
          Anmeldungen und Änderungen.
        </li>
        {/* Отдельным пунктом, а не в логах сервера: эти данные СВЯЗАНЫ
            с компанией и человеком — в отличие от логов, про которые ниже
            сказано, что они с другими данными не объединяются. */}
        <li>
          <b>Zustimmung zu den Ausstellungsbedingungen:</b> Name und Funktion der
          handelnden Person, ihre E-Mail-Adresse, Zeitpunkt der Zustimmung, akzeptierte
          Fassung sowie die IP-Adresse, von der die Zustimmung erfolgt ist. Diese Angaben
          werden dem Ausstellerkonto zugeordnet und dienen ausschliesslich dem Nachweis
          des Vertragsschlusses.
        </li>
      </ul>

      <h2 style={S.h2}>Wozu</h2>
      <p style={S.p}>
        Zur Bearbeitung Ihrer Anfrage, zur Durchführung der Messeteilnahme und für den
        Eintrag im Ausstellerverzeichnis auf Website, in der App und im Event-Guide.
        Für Werbung ohne Bezug zu Ihrer Teilnahme verwenden wir diese Daten nicht.
      </p>

      <h2 style={S.h2}>Wer die Daten sonst noch sieht</h2>
      <p style={S.p}>Wir setzen folgende Dienstleister ein:</p>
      <ul style={S.ul}>
        <li><b>Supabase</b> — Datenbank und Dateiablage, Serverstandort Zürich, Schweiz.</li>
        <li><b>Resend</b> — Versand der E-Mails, Serverstandort Irland.</li>
        <li><b>Vercel</b> — Betrieb des Portals, Serverstandort USA.</li>
      </ul>

      <h2 style={S.h2}>Cookies</h2>
      <p style={S.p}>
        Nach der Anmeldung setzen wir ein Cookie, das Ihre Sitzung offen hält. Ohne
        dieses Cookie funktioniert der Login nicht — es ist technisch notwendig und
        dient keiner Auswertung. Beim Abmelden wird es gelöscht.
      </p>
      <p style={S.p}>
        Für die Reichweitenmessung nutzen wir Vercel Web Analytics. Der Dienst zählt
        Seitenaufrufe, setzt dafür <b>keine Cookies</b> und erstellt keine Profile
        einzelner Personen.
      </p>

      <h2 style={S.h2}>Server-Logfiles</h2>
      <p style={S.p}>
        Beim Aufruf des Portals fallen technische Protokolldaten an: IP-Adresse,
        Zeitpunkt, aufgerufene Adresse und Browserangaben. Sie dienen dem sicheren
        Betrieb und der Fehlersuche und werden nicht mit anderen Daten zusammengeführt.
        Davon zu unterscheiden ist die IP-Adresse, die bei der Zustimmung zu den
        Ausstellungsbedingungen als Nachweis erfasst und dem Ausstellerkonto zugeordnet
        wird — siehe oben.
      </p>

      <h2 style={S.h2}>Aufbewahrung</h2>
      <p style={S.p}>
        Anfragen und Ausstellerdaten bewahren wir so lange auf, wie es für die Durchführung
        der Messe und die gesetzlichen Aufbewahrungsfristen nötig ist.
      </p>

      <h2 style={S.h2}>Ihre Rechte</h2>
      <p style={S.p}>
        Sie können jederzeit Auskunft über Ihre Daten verlangen sowie deren Berichtigung
        oder Löschung. Eine Nachricht an die oben genannte Adresse genügt.
      </p>

      <h2 style={S.h2}>Links auf andere Websites</h2>
      <p style={S.p}>
        Das Portal verweist auf externe Angebote, etwa auf Ablagen mit Marken- und
        Bildmaterial. Für deren Inhalte und deren Umgang mit Daten sind die jeweiligen
        Anbieter verantwortlich. Auf diese Seiten haben wir keinen Einfluss.
      </p>

      <h2 style={S.h2}>Änderungen dieser Erklärung</h2>
      <p style={S.p}>
        Wir passen diese Erklärung an, wenn sich das Portal oder die eingesetzten
        Dienste ändern. Massgebend ist die jeweils hier veröffentlichte Fassung.
      </p>

      <p style={S.foot}>
        <a href="/hallenplan">Zurück zum Hallenplan</a>
      </p>
      </main>
      <SiteFooter />
    </>
  );
}

const S = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' },
  entwurf: {
    border: '1px solid #B4530E',
    color: '#B4530E',
    borderRadius: 3,
    padding: '10px 12px',
    fontSize: 13,
    marginBottom: 28,
  },
  h1: { fontSize: 28, letterSpacing: '-0.6px', margin: '0 0 6px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 28px' },
  h2: { fontSize: 16, margin: '28px 0 8px', fontWeight: 700 },
  p: { margin: '0 0 10px' },
  ul: { margin: '0 0 10px', paddingLeft: 20 },
  foot: { marginTop: 36, fontSize: 13 },
};
