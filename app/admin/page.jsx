import { requirePageStaff } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';
import AdminClient from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Своя проверка, а не расчёт на layout: они рендерятся параллельно.
  await requirePageStaff();

  const [
    { data: anfragen },
    { data: companies },
    { data: zugaenge },
    { data: stands },
    { data: interesse },
  ] = await Promise.all([
    supabaseAdmin
      .from('mz_anfragen')
      .select(
        'id, created_at, firma, name, email, telefon, nachricht, stand_id, status, company_id, kategorie, zone, marken, marketing_consent'
      )
      .order('created_at', { ascending: false })
      .limit(100),
    supabaseAdmin.from('mz_companies').select('id, name, status').order('name'),
    supabaseAdmin.from('mz_allowlist').select('email, company_id, aktiv').order('email'),
    supabaseAdmin.from('mz_stands').select('status'),
    supabaseAdmin
      .from('mz_preis_interesse')
      .select('id, created_at, email, firma, stand_id, marketing_consent, anfrage_id')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  const frei = (stands || []).filter((s) => s.status === 'frei').length;
  const neu = (anfragen || []).filter((a) => a.status === 'neu').length;

  // Воронка, а не список. Строки не показывают, что процесс встал; отношение
  // «оставили почту → дошли до заявки» показывает.
  const kontakte = interesse || [];
  const ausKontakten = kontakte.filter((k) => k.anfrage_id).length;

  // Что висит без движения. Три рабочих дня — граница, после которой
  // в B2B перезванивает конкурент.
  const grenze = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const liegen = (anfragen || []).filter(
    (a) => a.status === 'neu' && new Date(a.created_at).getTime() < grenze
  ).length;

  return (
    <>
      <h1 style={S.h1}>Übersicht</h1>
      <p style={S.lead}>
        {neu} neue {neu === 1 ? 'Anfrage' : 'Anfragen'} · {companies?.length || 0} Firmen ·{' '}
        {frei} von {stands?.length || 0} Flächen frei
      </p>

      {liegen > 0 && (
        <p style={S.warnung}>
          {liegen} {liegen === 1 ? 'Anfrage liegt' : 'Anfragen liegen'} seit über drei Tagen
          unbearbeitet.
        </p>
      )}

      <section style={S.trichter}>
        <div>
          <div style={S.zahl}>{kontakte.length}</div>
          <div style={S.zahlText}>Kontakte über Preisanfrage</div>
        </div>
        <div>
          <div style={S.zahl}>{ausKontakten}</div>
          <div style={S.zahlText}>davon zur Anfrage geworden</div>
        </div>
        <div>
          <div style={S.zahl}>{kontakte.filter((k) => k.marketing_consent).length}</div>
          <div style={S.zahlText}>mit Newsletter-Einwilligung</div>
        </div>
      </section>

      <AdminClient
        anfragen={anfragen || []}
        companies={companies || []}
        zugaenge={zugaenge || []}
        kontakte={kontakte}
      />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 16px' },
  warnung: {
    background: '#FBF1D2',
    border: '1px solid #E3CE86',
    borderRadius: 3,
    padding: '10px 13px',
    fontSize: 13,
    margin: '0 0 16px',
    maxWidth: 620,
  },
  trichter: {
    display: 'flex',
    gap: 28,
    flexWrap: 'wrap',
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '14px 18px',
    marginBottom: 22,
    maxWidth: 620,
  },
  zahl: { fontSize: 22, fontWeight: 700, lineHeight: 1.1 },
  zahlText: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
};
