import { requirePageCompany } from '../../../lib/auth';
import { loadServiceOrder } from '../../../lib/service';
import { marketingAnfragenFuerCompany } from '../../../lib/marketing';
import OrderForm from '../technik/order-form';
import MarketingAnfragen from './marketing-anfragen';

export const dynamic = 'force-dynamic';

/**
 * Реклама в печатном Event-Guide и остальные маркетинговые блоки.
 *
 * Форма бронирования та же, что у техники: механика заказа одна на оба
 * раздела, и это намеренно — иначе они разошлись бы на первой же правке.
 *
 * Блоки ниже (цифровой каталог, LED-Wall, дизайн, правка данных) устроены
 * иначе: там не «позиции с количествами», а разговор — экспонент просит,
 * Messeleitung отвечает вручную. Условий и цен для них нет, поэтому над ними
 * стоит честная плашка.
 */
export default async function MarketingPage() {
  const session = await requirePageCompany();
  const [{ katalog, bemerkung, eingereichtAm }, anfragen] = await Promise.all([
    loadServiceOrder(session.companyId, 'marketing'),
    marketingAnfragenFuerCompany(session.companyId),
  ]);

  return (
    <>
      <h1 style={S.h1}>Marketing &amp; Sichtbarkeit</h1>
      <p style={S.lead}>
        Werbung im gedruckten Event-Guide. Format A5, Auflage 4&apos;000 Exemplare. Der Guide
        wird am Eingang abgegeben und liegt in beiden Hallen auf. Eine Platzierung ist auch
        ohne eigene Ausstellungsfläche möglich.
      </p>
      <p style={S.lead}>
        Redaktionsschluss <span style={S.xx}>XX.XX.2027</span>. Die Konditionen erhalten Sie
        mit der Auftragsbestätigung.
      </p>

      {katalog.length === 0 ? (
        <p style={S.lead}>Die Formate werden gerade vorbereitet.</p>
      ) : (
        <OrderForm
          katalog={katalog}
          bemerkung={bemerkung}
          eingereichtAm={eingereichtAm}
          bereich="marketing"
          submitLabel="Buchung übermitteln"
        />
      )}

      <h2 style={S.h2}>Weitere Möglichkeiten</h2>
      <MarketingAnfragen anfragen={anfragen} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 14px', maxWidth: '68ch' },
  xx: { color: '#A32A25', fontWeight: 700 },
  h2: { fontSize: 19, margin: '34px 0 14px', fontWeight: 700, letterSpacing: '-0.3px' },
};
