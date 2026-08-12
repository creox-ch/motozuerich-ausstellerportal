import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { validateNewCompany } from '../../../../lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Завести компанию. */
export async function POST(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const { ok, error, value } = validateNewCompany(body);
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  const { data, error: dbError } = await supabaseAdmin
    .from('mz_companies')
    .insert(value)
    .select('id, name, status')
    .single();

  if (dbError) {
    console.error('admin companies POST:', dbError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  // Если компанию завели из заявки — связываем их, чтобы было видно,
  // откуда пришёл экспонент.
  if (typeof body.anfrage_id === 'string' && body.anfrage_id) {
    await supabaseAdmin
      .from('mz_anfragen')
      .update({ company_id: data.id, status: 'gewonnen' })
      .eq('id', body.anfrage_id);
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: data.id,
    user_id: auth.user.id,
    aktion: 'admin_company_created',
    details: { name: data.name, aus_anfrage: body.anfrage_id || null },
  });

  return Response.json({ ok: true, company: data });
}
