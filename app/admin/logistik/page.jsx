import { requirePageStaff } from '../../../lib/auth';
import { alleLogistik } from '../../../lib/logistik';
import AdminLogistikClient from './logistik-client';

export const dynamic = 'force-dynamic';

export default async function AdminLogistikPage() {
  await requirePageStaff();

  const anmeldungen = await alleLogistik();
  const offen = anmeldungen.filter((a) => !a.an_fenster && !a.ab_fenster).length;

  return (
    <>
      <h1 style={S.h1}>Anreise und Parking</h1>
      <p style={S.lead}>
        {anmeldungen.length} {anmeldungen.length === 1 ? 'Anmeldung' : 'Anmeldungen'}
        {offen > 0 ? `, davon ${offen} ohne Zeitfenster` : ''}. Das zugeteilte Fenster sieht
        der Aussteller sofort im Portal.
      </p>

      <AdminLogistikClient anmeldungen={anmeldungen} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '70ch' },
};
