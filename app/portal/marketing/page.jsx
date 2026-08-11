import { requirePageCompany } from '../../../lib/auth';
import { loadServiceOrder } from '../../../lib/service';
import OrderForm from '../technik/order-form';

export const dynamic = 'force-dynamic';

/**
 * Реклама в печатном Event-Guide.
 *
 * Форма та же, что у техники: механика заказа одна на оба раздела, и это
 * намеренно — иначе они разошлись бы на первой же правке.
 *
 * Остальные блоки прототипа (онлайн-каталог, LED-Wall, запрос на дизайн,
 * заявка на изменение) здесь пока не реализованы: у них другая механика,
 * не «набор позиций с количествами».
 */
export default async function MarketingPage() {
  const session = await requirePageCompany();
  const { katalog, bemerkung, eingereichtAm } = await loadServiceOrder(
    session.companyId,
    'marketing'
  );

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

      <p style={S.hint}>
        Druckdaten, Gestaltung im MOTO-ZÜRICH-Look und die Online-Präsenz im digitalen
        Katalog folgen. Bis dahin zeigt der <a href="/prototyp">Prototyp</a> den geplanten
        Umfang.
      </p>
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 14px', maxWidth: '68ch' },
  xx: { color: '#A32A25', fontWeight: 700 },
  hint: { fontSize: 13, color: 'var(--muted)', marginTop: 22, maxWidth: '64ch' },
};
