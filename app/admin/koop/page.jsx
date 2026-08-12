import { requirePageStaff } from '../../../lib/auth';
import { alleNachweise } from '../../../lib/koop';
import AdminKoopClient from './koop-client';

export const dynamic = 'force-dynamic';

export default async function AdminKoopPage() {
  await requirePageStaff();

  const nachweise = await alleNachweise();
  const offen = nachweise.filter((n) => n.status === 'eingereicht').length;

  return (
    <>
      <h1 style={S.h1}>Gemeinsame Aktivitäten</h1>
      <p style={S.lead}>
        {offen === 0 ? 'Alles geprüft.' : `${offen} zur Prüfung.`} Bestätigte Punkte werden
        dem Aussteller sofort angezeigt und später von der Marketingrechnung abgezogen.
      </p>

      <AdminKoopClient nachweise={nachweise} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '70ch' },
};
