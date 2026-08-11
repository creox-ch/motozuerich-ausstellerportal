import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Кто вошёл и что за компания. Первый роут, работающий с данными компании,
 * поэтому он же — образец: сначала requireCompany, и только потом запрос,
 * ограниченный полученным company_id.
 */
export async function GET() {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin
    .from('mz_companies')
    .select('id, name, status, kategorie')
    .eq('id', auth.companyId)
    .maybeSingle();

  if (error) {
    console.error('me: не удалось прочитать компанию', error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  return Response.json({
    ok: true,
    email: auth.user.email,
    rolle: auth.rolle,
    company: data || null,
  });
}
