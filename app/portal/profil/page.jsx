import { requirePageCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { EDITABLE_FIELDS } from '../../../lib/profile';
import { signedUrl } from '../../../lib/storage';
import ProfileForm from './profile-form';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  // Своя проверка, а не расчёт на layout: он рендерится параллельно.
  const session = await requirePageCompany();

  const { data: profile } = await supabaseAdmin
    .from('mz_companies')
    .select(['id', 'status', 'logo_path', ...EDITABLE_FIELDS].join(', '))
    .eq('id', session.companyId)
    .maybeSingle();

  return (
    <>
      <h1 style={S.h1}>Firmenprofil</h1>
      <p style={S.lead}>
        Stammdaten für Vertrag und Rechnung sowie Ihr Eintrag für Website, App und Event-Guide.
        Sie können jederzeit speichern und später weiterarbeiten.
      </p>
      <ProfileForm initial={profile || {}} logoUrl={await signedUrl(profile?.logo_path)} />
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '64ch' },
};
