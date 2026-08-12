import { requirePageCompany } from '../../../lib/auth';
import { dokumenteFuerCompany, formatBetrag } from '../../../lib/dokumente';

export const dynamic = 'force-dynamic';

/**
 * Dokumente & Rechnungen: всё, что приходит экспоненту от Messeleitung.
 *
 * Раздел не архивный. Счёт за площадь сюда попадает уже оплаченным — доступ
 * в портал выдают после оплаты. Но за дополнительные заказы (техника, реклама,
 * парковка) счета выставляются здесь, и по разделу человек понимает, сколько
 * ещё должен.
 *
 * Ссылка ведёт не на файл, а на наш роут: он проверяет права и только потом
 * выдаёт подписанную ссылку на десять минут.
 */
export default async function DokumentePage() {
  const session = await requirePageCompany();
  const { dokumente, rechnungen } = await dokumenteFuerCompany(session.companyId);

  const offen = rechnungen.filter((r) => !r.bezahlt_am);

  return (
    <>
      <h1 style={S.h1}>Dokumente &amp; Rechnungen</h1>
      <p style={S.lead}>
        Unterlagen der Messeleitung und Rechnungen zu Ihren Bestellungen. Fragen zu einer
        Rechnung? Antworten Sie einfach auf die E-Mail der Messeleitung.
      </p>

      <section style={S.card}>
        <h2 style={S.h2}>
          Rechnungen <span style={S.count}>{rechnungen.length}</span>
          {offen.length > 0 && <span style={S.offenBadge}>{offen.length} offen</span>}
        </h2>

        {rechnungen.length === 0 ? (
          <p style={S.empty}>
            Noch keine Rechnungen. Rechnungen zu Bestellungen aus dem Portal erscheinen hier,
            sobald die Messeleitung sie ausgestellt hat.
          </p>
        ) : (
          <ul style={S.list}>
            {rechnungen.map((r) => (
              <li key={r.id} style={S.item}>
                <div style={S.itemMain}>
                  <div style={S.titel}>{r.titel}</div>
                  <div style={S.meta}>
                    {formatBetrag(r.betrag_rappen) || <span style={S.xx}>XX</span>}
                    {r.faellig_am && ` · fällig ${formatDatum(r.faellig_am)}`}
                    {' · '}
                    {r.bezahlt_am ? (
                      <span style={S.bezahlt}>bezahlt</span>
                    ) : (
                      <span style={S.offen}>offen</span>
                    )}
                  </div>
                </div>
                <a href={`/api/dokumente?id=${r.id}`} style={S.download} className="tap">
                  Herunterladen
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ ...S.card, marginTop: 16 }}>
        <h2 style={S.h2}>
          Dokumente <span style={S.count}>{dokumente.length}</span>
        </h2>

        {dokumente.length === 0 ? (
          <p style={S.empty}>
            Noch keine Dokumente. AGB, Teilnahmebedingungen und das technische Merkblatt
            finden Sie hier, sobald sie vorliegen.
          </p>
        ) : (
          <ul style={S.list}>
            {dokumente.map((d) => (
              <li key={d.id} style={S.item}>
                <div style={S.itemMain}>
                  <div style={S.titel}>{d.titel}</div>
                  <div style={S.meta}>
                    {d.dateiname}
                    {d.groesse_bytes ? ` · ${formatGroesse(d.groesse_bytes)}` : ''}
                  </div>
                </div>
                <a href={`/api/dokumente?id=${d.id}`} style={S.download} className="tap">
                  Herunterladen
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Дата из базы приходит как «2027-02-19». Показываем по-швейцарски. */
function formatDatum(iso) {
  const [jahr, monat, tag] = String(iso).split('-');
  return tag && monat && jahr ? `${tag}.${monat}.${jahr}` : String(iso);
}

function formatGroesse(bytes) {
  const mb = Number(bytes) / 1024 / 1024;
  if (!Number.isFinite(mb)) return '';
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(Number(bytes) / 1024))} KB`;
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '68ch' },
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '18px 20px',
    maxWidth: 720,
  },
  h2: { fontSize: 15, margin: '0 0 12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 },
  count: { color: 'var(--muted)', fontWeight: 400 },
  offenBadge: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: 700,
    background: '#FBF1D2',
    borderRadius: 2,
    padding: '3px 8px',
  },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 0',
    borderTop: '1px solid var(--line)',
    flexWrap: 'wrap',
  },
  itemMain: { flex: '1 1 220px', minWidth: 0 },
  titel: { fontWeight: 600, fontSize: 14 },
  meta: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  download: {
    padding: '9px 14px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    color: 'var(--ink)',
  },
  bezahlt: { color: '#1B7A5A', fontWeight: 600 },
  offen: { color: '#A32A25', fontWeight: 600 },
  xx: { color: '#A32A25', fontWeight: 700 },
  empty: { fontSize: 13, color: 'var(--muted)', margin: 0 },
};
