import { requirePageCompany } from '../../../lib/auth';
import { loadServiceOrder } from '../../../lib/service';
import OrderForm from './order-form';

export const dynamic = 'force-dynamic';

export default async function TechnikPage() {
  const session = await requirePageCompany();
  const { katalog, bemerkung, eingereichtAm } = await loadServiceOrder(session.companyId);

  return (
    <>
      <h1 style={S.h1}>Technik &amp; Service</h1>
      <p style={S.lead}>
        Alles, was Sie für Ihren Stand bestellen können. Mengen erfassen, speichern und
        übermitteln — die Konditionen erhalten Sie mit der Auftragsbestätigung.
        Bestellschluss <span style={S.xx}>XX.XX.2027</span>, spätere Bestellungen nur nach
        Verfügbarkeit.
      </p>

      {katalog.length === 0 ? (
        <p style={S.lead}>Der Katalog wird gerade vorbereitet.</p>
      ) : (
        <OrderForm katalog={katalog} bemerkung={bemerkung} eingereichtAm={eingereichtAm} />
      )}
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '68ch' },
  xx: { color: '#A32A25', fontWeight: 700 },
};
