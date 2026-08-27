import SiteFooter from '../site-footer';

export const metadata = {
  title: 'Impressum · Ausstellerportal MOTO-ZÜRICH 2027',
};

/**
 * ⚠️ ЧЕРНОВИК — юридической вычитки не проходил.
 *
 * Реквизиты 27.08 приведены к Impressum сайта motozuerich.ch, где сказано прямо:
 * «Die Website www.motozuerich.ch sowie die Veranstaltung MOTO-ZÜRICH werden
 * betrieben von: Creox GmbH». До этого здесь стояла «Vollenweider & Schweizer
 * GmbH, Baden» — догадка из карты обработчиков платформы, ничем не
 * подтверждённая. Ив Волленвайдер — Geschäftsführer Creox GmbH, отсюда
 * и взялась фамилия в названии.
 *
 * Плашка «Entwurf» остаётся: реквизиты теперь из достоверного источника,
 * но текст страницы юрист всё ещё не читал. См. docs/rechtliches-review.md.
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
          Creox GmbH — Event-Marketing-Agentur
          <br />
          Grabenstrasse 15b, 6340 Baar (ZG), Schweiz
          <br />
          Handelsregister: Sitz Baar, Kanton Zug · UID CHE-169.690.018
          <br />
          Geschäftsführer: Yves Vollenweider (Einzelunterschrift)
        </p>

        <h2 style={S.h2}>Kontakt</h2>
        <p style={S.p}>
          <a href="mailto:team@motozuerich.ch">team@motozuerich.ch</a>
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
