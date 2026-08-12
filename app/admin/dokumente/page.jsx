import { requirePageStaff } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { alleDokumente } from '../../../lib/dokumente';
import DokumenteClient from './dokumente-client';

export const dynamic = 'force-dynamic';

export default async function AdminDokumentePage() {
  // Своя проверка, а не расчёт на layout: они рендерятся параллельно.
  await requirePageStaff();

  const [dokumente, { data: companies }] = await Promise.all([
    alleDokumente(),
    supabaseAdmin.from('mz_companies').select('id, name').order('name'),
  ]);

  return (
    <>
      <h1 style={S.h1}>Dokumente &amp; Rechnungen</h1>
      <p style={S.lead}>
        Was Sie hier ablegen, sieht der Aussteller sofort im Portal. Ohne Firma ist das
        Dokument für alle Aussteller sichtbar — eine Rechnung braucht immer eine Firma.
      </p>

      <DokumenteClient dokumente={dokumente} companies={companies || []} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '70ch' },
};
