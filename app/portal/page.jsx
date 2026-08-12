import { requirePageCompany } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';
import { formatSize, standsOfCompany } from '../../lib/stands';
import { fristenFuerCompany } from '../../lib/fristen';

export const dynamic = 'force-dynamic';

/**
 * Übersicht кабинета. Пока показывает только то, что уже есть по-настоящему:
 * компанию и её статус. Разделы прототипа появятся здесь по мере перевода
 * на живые данные — обещать их пустыми карточками смысла нет.
 */
export default async function PortalHome() {
  // Своя проверка, а не расчёт на гард в layout: layout и page в Next 14
  // рендерятся параллельно, и без этой строки страница падает на пустой сессии.
  const session = await requirePageCompany();

  const { data: company } = await supabaseAdmin
    .from('mz_companies')
    .select('name, status, kategorie')
    .eq('id', session.companyId)
    .maybeSingle();

  const stands = await standsOfCompany(session.companyId);
  const fristen = await fristenFuerCompany(session.companyId);

  return (
    <>
      <h1 style={S.h1}>Übersicht</h1>
      <p style={S.lead}>
        Willkommen im Ausstellerportal. Hier entstehen Schritt für Schritt alle Bereiche
        rund um Ihren Auftritt an der MOTO-ZÜRICH 2027.
      </p>

      <div style={S.card}>
        <h2 style={S.h2}>Ihr Ausstellerkonto</h2>
        <dl style={S.dl}>
          <div style={S.kv}>
            <dt style={S.dt}>Firma</dt>
            <dd style={S.dd}>{company?.name || '—'}</dd>
          </div>
          <div style={S.kv}>
            <dt style={S.dt}>Status</dt>
            <dd style={S.dd}>{STATUS_TEXT[company?.status] || company?.status || '—'}</dd>
          </div>
          <div style={S.kv}>
            <dt style={S.dt}>Kategorie</dt>
            <dd style={S.dd}>{company?.kategorie || 'noch nicht erfasst'}</dd>
          </div>
        </dl>
      </div>

      <div style={{ ...S.card, marginTop: 16 }}>
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

      <div style={{ ...S.card, marginTop: 16, maxWidth: 720 }}>
        <h2 style={S.h2}>Fristen und offene Aufgaben</h2>
        <ul style={S.fristen}>
          {fristen.map((f) => (
            <li key={f.id} style={S.frist}>
              <span style={f.offen ? S.datumOffen : S.datum}>{f.anzeige}</span>
              <span style={S.fristText}>
                <span style={f.erledigt ? S.titelErledigt : undefined}>{f.titel}</span>
                {f.erledigt === true && <span style={S.erledigt}> · erledigt</span>}
                {f.hinweis && <em style={S.fristHint}>{f.hinweis}</em>}
              </span>
              {f.ziel && (
                <a href={f.ziel} style={S.fristLink} className="tap">
                  öffnen
                </a>
              )}
            </li>
          ))}
        </ul>
        <p style={S.hint}>
          Rot markierte Daten sind noch nicht festgelegt — wir tragen sie nach, sobald sie
          feststehen. Erledigt wird nur angezeigt, wo wir es an Ihren Angaben sehen.
        </p>
      </div>

      <p style={S.next}>
        <a href="/portal/hallenplan" className="tap">Hallenplan ansehen →</a>
        {' · '}
        <a href="/portal/profil" className="tap">Firmenprofil ausfüllen →</a>
        {' · '}
        <a href="/portal/technik" className="tap">Technik &amp; Service bestellen →</a>
        {' · '}
        <a href="/portal/marketing" className="tap">Event-Guide buchen →</a>
        {' · '}
        <a href="/portal/dokumente" className="tap">Dokumente &amp; Rechnungen →</a>
        {' · '}
        <a href="/portal/nachrichten" className="tap">Nachrichten →</a>
        {' · '}
        <a href="/portal/aktivitaeten" className="tap">Aktivität einreichen →</a>
      </p>

      <p style={S.hint}>
        Die weiteren Bereiche — Anreise, Ausweise, gemeinsame Aktivitäten — folgen. Bis dahin können Sie
        den <a href="/prototyp">Prototyp</a> ansehen: er zeigt den geplanten Umfang,
        arbeitet aber mit Beispieldaten.
      </p>
    </>
  );
}

const STATUS_TEXT = {
  interessent: 'Interessent',
  angemeldet: 'Angemeldet',
  bestaetigt: 'Bestätigt',
  abgesagt: 'Abgesagt',
};

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
  next: { marginTop: 18, marginBottom: 0, fontWeight: 600 },
  hint: { fontSize: 13, color: 'var(--muted)', marginTop: 20, maxWidth: '64ch' },

  fristen: { listStyle: 'none', margin: 0, padding: 0 },
  frist: {
    display: 'flex',
    gap: 12,
    alignItems: 'baseline',
    padding: '9px 0',
    borderBottom: '1px solid var(--line)',
    flexWrap: 'wrap',
  },
  datum: { flex: '0 0 108px', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 13 },
  // Красным помечено то, что внутри ещё не решено, — как в прототипе.
  datumOffen: {
    flex: '0 0 108px',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700,
    fontSize: 13,
    color: '#A32A25',
  },
  fristText: { flex: '1 1 220px', minWidth: 0, fontSize: 14 },
  titelErledigt: { color: 'var(--muted)', textDecoration: 'line-through' },
  erledigt: { color: '#1B7A5A', fontSize: 12, fontWeight: 600 },
  fristHint: { display: 'block', fontSize: 12, color: 'var(--muted)', fontStyle: 'normal', marginTop: 2 },
  fristLink: { fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--blue)' },
};
