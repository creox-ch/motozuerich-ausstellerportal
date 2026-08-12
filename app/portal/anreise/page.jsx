import { requirePageCompany } from '../../../lib/auth';
import { logistikFuerCompany } from '../../../lib/logistik';
import NochNicht from '../noch-nicht';
import LogistikForm from './logistik-form';

export const dynamic = 'force-dynamic';

/**
 * Anreise, Aufbau und Parking.
 *
 * Раздел принимает заявку, но НЕ бронирует окно: квоты ворот площадка ещё
 * не назвала. Плашка об этом стоит наверху — экспонент должен понимать,
 * что времени у него пока нет, а не считать себя записанным.
 */
export default async function AnreisePage() {
  const session = await requirePageCompany();
  const logistik = await logistikFuerCompany(session.companyId);

  return (
    <>
      <h1 style={S.h1}>Anreise, Aufbau und Parking</h1>
      <p style={S.lead}>
        Die Zufahrt zu den Hallen läuft nur mit Zeitfenster. Melden Sie hier Ihren Bedarf an
        — Fahrzeug, Wunschtag und Parkkarten.
      </p>

      <NochNicht was="Die Buchung fester Zeitfenster">
        Die Zeitfenster hängen von Toren und Rampen ab und stehen noch nicht fest. Ihre
        Angaben erreichen die Messeleitung, das verbindliche Fenster teilen wir Ihnen zu.
      </NochNicht>

      <LogistikForm logistik={logistik} />

      <section style={S.card}>
        <h2 style={S.h2}>Gut zu wissen</h2>
        <ul style={S.rules}>
          <li>
            Zufahrt nur im zugeteilten Zeitfenster, Wartebereich <span style={S.xx}>XX</span>.
          </li>
          <li>
            Rangieren und Entladen maximal <span style={S.xx}>XX</span> Minuten, danach
            Fahrzeug auf den Aussenparkplatz.
          </li>
          <li>
            Torhöhe <span style={S.xx}>XX</span> m, Bodenbelastung <span style={S.xx}>XX</span>{' '}
            kg/m².
          </li>
          <li>Hubwagen begrenzt verfügbar, Stapler nur über Technik &amp; Service.</li>
          <li>
            Anlieferung ausserhalb der Fenster nur nach Absprache mit dem technischen Büro.
          </li>
          <li>Leergut und Verpackung dürfen nicht in den Gängen gelagert werden.</li>
          <li>
            StageOne und Halle 550 liegen wenige Gehminuten auseinander — Zufahrt und
            Zeitfenster gelten pro Halle.
          </li>
          <li>
            Der Abbau beginnt erst nach Messeschluss am Sonntag, 21. Februar 2027 um{' '}
            <span style={S.xx}>XX:XX</span> Uhr. Früheres Abbauen ist nicht gestattet.
          </li>
        </ul>
        <p style={S.hint}>
          Rot markierte Angaben stehen noch nicht fest — sie kommen von der Halle.
        </p>
      </section>
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 18px', maxWidth: '68ch' },
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '18px 20px',
    marginTop: 16,
    maxWidth: 720,
  },
  h2: { fontSize: 15, margin: '0 0 12px', fontWeight: 700 },
  rules: { margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 },
  xx: { color: '#A32A25', fontWeight: 700 },
  hint: { fontSize: 12, color: 'var(--muted)', marginTop: 12, marginBottom: 0 },
};
