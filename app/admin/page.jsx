import { requirePageStaff } from '../../lib/auth';
import { supabaseAdmin } from '../../lib/supabase';
import AdminClient from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Своя проверка, а не расчёт на layout: они рендерятся параллельно.
  await requirePageStaff();

  const [{ data: anfragen }, { data: companies }, { data: zugaenge }, { data: stands }] =
    await Promise.all([
      supabaseAdmin
        .from('mz_anfragen')
        .select('id, created_at, firma, name, email, telefon, nachricht, stand_id, status, company_id')
        .order('created_at', { ascending: false })
        .limit(100),
      supabaseAdmin.from('mz_companies').select('id, name, status').order('name'),
      supabaseAdmin.from('mz_allowlist').select('email, company_id, aktiv').order('email'),
      supabaseAdmin.from('mz_stands').select('status'),
    ]);

  const frei = (stands || []).filter((s) => s.status === 'frei').length;
  const neu = (anfragen || []).filter((a) => a.status === 'neu').length;

  return (
    <>
      <h1 style={S.h1}>Übersicht</h1>
      <p style={S.lead}>
        {neu} neue {neu === 1 ? 'Anfrage' : 'Anfragen'} · {companies?.length || 0} Firmen ·{' '}
        {frei} von {stands?.length || 0} Flächen frei
      </p>

      <AdminClient
        anfragen={anfragen || []}
        companies={companies || []}
        zugaenge={zugaenge || []}
      />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px' },
};
