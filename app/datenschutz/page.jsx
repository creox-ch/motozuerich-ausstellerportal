export const metadata = {
  title: 'Datenschutzerklärung · Ausstellerportal MOTO-ZÜRICH 2027',
  robots: { index: false, follow: false },
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
        Vollenweider &amp; Schweizer GmbH, Baden. Kontakt für Datenschutzanliegen:{' '}
        <a href="mailto:yves@motozuerich.ch">yves@motozuerich.ch</a>
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

      <p style={S.foot}>
        <a href="/hallenplan">Zurück zum Hallenplan</a>
      </p>
    </main>
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
