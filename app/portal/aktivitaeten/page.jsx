import { requirePageCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { aktivitaetenFuerCompany } from '../../../lib/aktivitaeten';
import { formatFrist } from '../../../lib/fristen';
import AktivitaetenClient from './aktivitaeten-client';

export const dynamic = 'force-dynamic';

/**
 * Активности на стенде.
 *
 * Раздел рабочий: заявка сохраняется и попадает к Messeleitung. Заглушка
 * здесь ровно одна — Redaktionsschluss, и она берётся из таблицы сроков,
 * а не зашита в текст.
 */
export default async function AktivitaetenPage() {
  const session = await requirePageCompany();

  const [aktivitaeten, { data: frist }] = await Promise.all([
    aktivitaetenFuerCompany(session.companyId),
    supabaseAdmin
      .from('mz_fristen')
      .select('datum, datum_bis')
      .eq('id', 'aktivitaeten')
      .maybeSingle(),
  ]);

  const redaktionsschluss = formatFrist(frist);
  const offen = !frist?.datum;

  return (
    <>
      <h1 style={S.h1}>Aktivitäten am Stand</h1>
      <p style={S.lead}>
        Stände mit Programm halten Besucher deutlich länger. Was Sie hier einreichen, prüft
        die Messeleitung für Messeprogramm, Event-Guide und Website.
      </p>
      <p style={S.lead}>
        Redaktionsschluss Event-Guide:{' '}
        <span style={offen ? S.xx : S.datum}>{redaktionsschluss}</span>. Online nehmen wir
        Beiträge bis kurz vor der Messe auf.
      </p>

      <AktivitaetenClient aktivitaeten={aktivitaeten} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 14px', maxWidth: '68ch' },
  xx: { color: '#A32A25', fontWeight: 700 },
  datum: { color: 'var(--ink)', fontWeight: 600 },
};
