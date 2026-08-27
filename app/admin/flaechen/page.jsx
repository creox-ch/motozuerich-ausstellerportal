import { requirePageStaff } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import FlaechenClient from './flaechen-client';

export const dynamic = 'force-dynamic';

export default async function FlaechenPage() {
  await requirePageStaff();

  const [{ data: stands }, { data: companies }] = await Promise.all([
    supabaseAdmin
      .from('mz_stands')
      .select('id, plan_id, halle, lage, breite_m, tiefe_m, flaeche_m2, status, company_id')
      .order('id'),
    supabaseAdmin.from('mz_companies').select('id, name').order('name'),
  ]);

  return (
    <>
      <h1 style={S.h1}>Flächen</h1>
      <p style={S.lead}>
        Änderungen sind sofort auf dem öffentlichen Hallenplan sichtbar. «vergeben»
        braucht eine Firma, «frei» darf keine haben.
      </p>
      <FlaechenClient stands={stands || []} companies={companies || []} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '64ch' },
};
