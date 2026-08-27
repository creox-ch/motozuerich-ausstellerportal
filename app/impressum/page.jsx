import SiteFooter from '../site-footer';

export const metadata = {
  title: 'Impressum · Ausstellerportal MOTO-ZÜRICH 2027',
};

/**
 * ⚠️ ЧЕРНОВИК — юридической вычитки не проходил.
 *
 * У выставки ДВА юрлица, и это не ошибка:
 *   Vollenweider & Schweizer GmbH, Baden (AG) — Verantwortliche Stelle
 *     по Datenschutz сайта и Vertragspartei по AGB;
 *   Creox GmbH, Baar (ZG) — по Impressum сайта «betreibt» сайт и мероприятие,
 *     это агентство событийного маркетинга.
 *
 * Здесь стоит V&S — то же юрлицо, что в Datenschutz портала, чтобы портал
 * не противоречил сам себе. Адрес 27.08 дополнен до полного из Datenschutz
 * сайта. Кого именно называть Betreiberin ПОРТАЛА — вопрос к юристу,
 * см. docs/rechtliches-review.md.
 */
export default function ImpressumPage() {
  return (
    <>
      <main style={S.wrap}>
        <div style={S.entwurf}>
          <strong>Entwurf.</strong> Angaben sind noch nicht bestätigt.
        </div>

        <h1 style={S.h1}>Impressum</h1>

        <h2 style={S.h2}>Betreiberin</h2>
        <p style={S.p}>
          Vollenweider &amp; Schweizer GmbH
          <br />
          Bäderstrasse 28, 5400 Baden (AG), Schweiz
        </p>

        <h2 style={S.h2}>Kontakt</h2>
        <p style={S.p}>
          <a href="mailto:yves@motozuerich.ch">yves@motozuerich.ch</a>
        </p>

        <h2 style={S.h2}>Zweck dieses Portals</h2>
        <p style={S.p}>
          Das Ausstellerportal dient der Organisation der Messeteilnahme an der
          MOTO-ZÜRICH 2027. Es richtet sich an Ausstellerinnen und Aussteller sowie an
          Unternehmen, die eine Standfläche anfragen möchten.
        </p>

        <h2 style={S.h2}>Haftung</h2>
        <p style={S.p}>
          Angaben zu Flächen, Terminen und Leistungen werden laufend aktualisiert. Rot
          markierte Werte sind intern noch nicht festgelegt. Verbindlich sind Offerte,
          Auftragsbestätigung und Vertrag.
        </p>

        <p style={S.foot}>
          <a href="/datenschutz">Datenschutzerklärung</a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

const S = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '40px 24px 20px' },
  entwurf: {
    border: '1px solid #B4530E',
    color: '#B4530E',
    borderRadius: 3,
    padding: '10px 12px',
    fontSize: 13,
    marginBottom: 28,
  },
  h1: { fontSize: 28, letterSpacing: '-0.6px', margin: '0 0 6px', fontWeight: 700 },
  h2: { fontSize: 16, margin: '28px 0 8px', fontWeight: 700 },
  p: { margin: '0 0 10px' },
  foot: { marginTop: 36, fontSize: 13 },
};
