import { requirePageCompany } from '../../../lib/auth';
import {
  MAX_PUNKTE,
  gruppiereMassnahmen,
  ladeKatalog,
  nachweiseFuerCompany,
  punkteSumme,
} from '../../../lib/koop';
import KoopClient from './koop-client';

export const dynamic = 'force-dynamic';

/**
 * Gemeinsame Aktivitäten: меры совместного маркетинга и подтверждения.
 *
 * Баллы за меры согласованы и стоят настоящими. Процент скидки за 100 баллов
 * бизнес не назвал — там XX. Считать его нам не из чего, а правдоподобное
 * число экспонент прочитает как обещание.
 */
export default async function AktionenPage() {
  const session = await requirePageCompany();

  const [katalog, nachweise] = await Promise.all([
    ladeKatalog(),
    nachweiseFuerCompany(session.companyId),
  ]);

  const summe = punkteSumme(nachweise, katalog);

  return (
    <>
      <h1 style={S.h1}>Gemeinsame Aktivitäten</h1>
      <p style={S.lead}>
        Wählen Sie Kommunikationsmassnahmen zugunsten von MOTO-ZÜRICH und setzen Sie sie um.
        Damit reduzieren sich Ihre Marketingkosten um bis zu <span style={S.xx}>XX</span> %.{' '}
        {MAX_PUNKTE} Punkte entsprechen der maximal möglichen Reduktion. Für jede Massnahme
        ist ein Nachweis nötig.
      </p>

      <section style={S.punkte}>
        <div style={S.zahlen}>
          <div>
            <div style={S.lab}>Bestätigt</div>
            <div style={S.big}>{summe.bestaetigt}</div>
          </div>
          <div>
            <div style={S.lab}>In Prüfung</div>
            <div style={S.big}>{summe.offen}</div>
          </div>
          <div>
            <div style={S.lab}>Erzielte Reduktion</div>
            <div style={S.big}>
              <span style={S.xx}>XX</span> %
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 210 }}>
            <div style={S.lab}>Maximal möglich</div>
            <div style={S.klein}>
              {MAX_PUNKTE} Punkte = <span style={S.xx}>XX</span> % Reduktion
            </div>
          </div>
        </div>
        <div style={S.bar}>
          <div style={{ ...S.barFill, width: `${summe.anteil}%` }} />
        </div>
        {summe.ueberschuss > 0 && (
          <p style={S.klein}>
            {summe.ueberschuss} Punkte über dem Maximum — angerechnet werden {MAX_PUNKTE}.
          </p>
        )}
      </section>

      <KoopClient
        gruppen={gruppiereMassnahmen(katalog)}
        katalog={katalog}
        nachweise={nachweise}
      />

      <section style={S.card}>
        <h2 style={S.h2}>Spielregeln</h2>
        <ul style={S.rules}>
          <li>
            Beiträge nur mit unseren oder vorab freigegebenen Visuals, Markierung
            @motozuerich.
          </li>
          <li>
            Rabattcodes für Ihre Kundenbasis stellen wir als QR-Code und Codeliste bereit,
            gültig bis <span style={S.xx}>XX.XX.2027</span>, Weitergabe nur an Ihre eigenen
            Kontakte.
          </li>
          <li>Punkte gelten nur für die Ausgabe 2027 und sind nicht auszahlbar.</li>
          <li>
            Die Reduktion wird direkt von Ihrer Marketingrechnung abgezogen, maximal{' '}
            <span style={S.xx}>XX</span> % pro Rechnung.
          </li>
          <li>
            Prüfung innert <span style={S.xx}>XX</span> Arbeitstagen. Nachweise spätestens
            bis <span style={S.xx}>XX.XX.2027</span>, danach verfallen die Punkte.
          </li>
        </ul>
      </section>
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 18px', maxWidth: '72ch' },
  xx: { color: '#A32A25', fontWeight: 700 },
  punkte: { background: 'var(--ink)', color: '#fff', borderRadius: 3, padding: '16px 20px', marginBottom: 18 },
  zahlen: { display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-end' },
  lab: { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#93a9c6' },
  big: { fontSize: 28, fontWeight: 700, lineHeight: 1.1 },
  klein: { fontSize: 13, color: '#c6d4e6', marginTop: 4 },
  bar: { height: 6, background: '#243D5E', borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--signal)' },
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '18px 20px',
    marginTop: 16,
    maxWidth: 760,
  },
  h2: { fontSize: 15, margin: '0 0 12px', fontWeight: 700 },
  rules: { margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 },
};
