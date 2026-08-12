import { requirePageCompany } from '../../../lib/auth';
import { nachrichtenFuerCompany } from '../../../lib/nachrichten';
import NachrichtenClient from './nachrichten-client';

export const dynamic = 'force-dynamic';

/**
 * Переписка с Messeleitung.
 *
 * Смысл раздела — чтобы вопрос и ответ лежали рядом с заказами, а не терялись
 * в почте: через полгода никто не вспомнит, в каком письме согласовали
 * исключение по монтажу.
 */
export default async function NachrichtenPage() {
  const session = await requirePageCompany();
  const nachrichten = await nachrichtenFuerCompany(session.companyId);

  return (
    <>
      <h1 style={S.h1}>Nachrichten</h1>
      <p style={S.lead}>
        Fragen an die Messeleitung. Antworten erscheinen hier, und wir benachrichtigen Sie
        per E-Mail.
      </p>

      <NachrichtenClient nachrichten={nachrichten} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '68ch' },
};
