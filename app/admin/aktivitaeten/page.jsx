import { requirePageStaff } from '../../../lib/auth';
import { alleAktivitaeten } from '../../../lib/aktivitaeten';
import AdminAktivitaetenClient from './aktivitaeten-client';

export const dynamic = 'force-dynamic';

export default async function AdminAktivitaetenPage() {
  await requirePageStaff();

  const aktivitaeten = await alleAktivitaeten();
  const offen = aktivitaeten.filter((a) => a.status === 'eingereicht').length;

  return (
    <>
      <h1 style={S.h1}>Aktivitäten am Stand</h1>
      <p style={S.lead}>
        {offen === 0 ? 'Alles geprüft.' : `${offen} in Prüfung.`} Angenommene Aktivitäten
        gehen ins Messeprogramm, in den Event-Guide und auf die Website.
      </p>

      <AdminAktivitaetenClient aktivitaeten={aktivitaeten} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '70ch' },
};
