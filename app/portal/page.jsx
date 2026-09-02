import { requirePageCompany } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';
import { formatSize, standsOfCompany } from '../../lib/stands';
import AgbAkzeptanz from './agb-akzeptanz';

export const dynamic = 'force-dynamic';

/**
 * Übersicht кабинета — сужено по вводной Ксении от 27.08 (docs/input-ksenia-2026-08-27.md).
 *
 * Убраны все даты, сроки и маркетинговые блоки — ровно то, что раньше жило
 * в блоке «Fristen und offene Aufgaben» (lib/fristen.js), и длинный список
 * ссылок на остальные разделы. Остаётся минимум из голосового: какой стенд,
 * приём AGB, пометка, что счета и сроки придут позже. Остальные разделы
 * кабинета никуда не делись (доступны по прямой ссылке из меню), но здесь
 * на них больше не давят датами и цифрами.
 *
 * ⚠️ Вводная записана, но НЕ согласована — статус на 27.08. Если Ксения
 * ответит иначе на 6 вопросов из docs/input-ksenia-2026-08-27.md
 * (особенно про то, скрывать разделы меню или нет), эту страницу и layout
 * нужно будет поправить ещё раз.
 */
export default async function PortalHome() {
  const session = await requirePageCompany();

  const { data: company } = await supabaseAdmin
    .from('mz_companies')
    .select('name, agb_akzeptiert_am, agb_version')
    .eq('id', session.companyId)
    .maybeSingle();

  const stands = await standsOfCompany(session.companyId);

  return (
    <>
      <h1 style={S.h1}>Übersicht</h1>
      <p style={S.lead}>
        Willkommen im Ausstellerportal, {company?.name || 'liebe Ausstellerin, lieber Aussteller'}.
      </p>

      <div style={S.card}>
        <h2 style={S.h2}>Ihr Stand</h2>
        {stands.length === 0 ? (
          <p style={S.empty}>
            Ihnen ist noch keine Fläche zugeteilt. Sobald die Messeleitung Ihren Stand
            bestätigt hat, erscheint er hier.
          </p>
        ) : (
          stands.map((stand) => (
            <dl key={stand.id} style={S.dl}>
              <div style={S.kv}>
                <dt style={S.dt}>Stand</dt>
                <dd style={S.dd}>{stand.id}</dd>
              </div>
              <div style={S.kv}>
                <dt style={S.dt}>Halle</dt>
                <dd style={S.dd}>{stand.halle}</dd>
              </div>
              <div style={S.kv}>
                <dt style={S.dt}>Lage</dt>
                <dd style={S.dd}>{stand.lage || '—'}</dd>
              </div>
              <div style={S.kv}>
                <dt style={S.dt}>Format</dt>
                <dd style={S.dd}>{formatSize(stand)}</dd>
              </div>
            </dl>
          ))
        )}
      </div>

      <AgbAkzeptanz akzeptiertAm={company?.agb_akzeptiert_am} version={company?.agb_version} />

      <p style={S.hint}>
        Rechnungen, Zahlungsfristen und weitere Termine folgen hier zu einem späteren Zeitpunkt.
        Sie müssen jetzt nichts weiter tun.
      </p>
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 24px', maxWidth: '64ch' },
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '18px 20px',
    maxWidth: 520,
  },
  h2: { fontSize: 15, margin: '0 0 14px', fontWeight: 700 },
  dl: { margin: 0 },
  kv: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '7px 0',
    borderBottom: '1px solid var(--line)',
  },
  dt: { color: 'var(--muted)', margin: 0 },
  dd: { margin: 0, fontWeight: 600, textAlign: 'right' },
  empty: { fontSize: 13, color: 'var(--muted)', margin: 0 },
  hint: { fontSize: 13, color: 'var(--muted)', marginTop: 20, maxWidth: '64ch' },
};
