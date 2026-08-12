import { requirePageStaff } from '../../../lib/auth';
import { alleMarketingAnfragen } from '../../../lib/marketing';
import AdminMarketingClient from './marketing-client';

export const dynamic = 'force-dynamic';

export default async function AdminMarketingPage() {
  await requirePageStaff();

  const anfragen = await alleMarketingAnfragen();
  const neu = anfragen.filter((a) => a.status === 'neu').length;

  return (
    <>
      <h1 style={S.h1}>Marketing-Anfragen</h1>
      <p style={S.lead}>
        {neu === 0 ? 'Nichts Neues.' : `${neu} neu.`} Digitaler Katalog, LED-Wall,
        Gestaltungswünsche und Änderungen an Website und Katalog. Konditionen sind nirgends
        hinterlegt — die Bearbeitung läuft von Hand.
      </p>

      <AdminMarketingClient anfragen={anfragen} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '70ch' },
};
