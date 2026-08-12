import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { validateStandUpdate } from '../../../../lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Статус площадки и её принадлежность. Виден на публичном плане сразу. */
export async function PATCH(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const standId = typeof body.id === 'string' ? body.id.trim() : '';
  if (!standId) return Response.json({ ok: false, error: 'Fläche fehlt.' }, { status: 400 });

  const { ok, error, value } = validateStandUpdate(body);
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  if (value.company_id) {
    const { data: company } = await supabaseAdmin
      .from('mz_companies')
      .select('id')
      .eq('id', value.company_id)
      .maybeSingle();
    if (!company) {
      return Response.json({ ok: false, error: 'Firma nicht gefunden.' }, { status: 400 });
    }
  }

  const { data, error: dbError } = await supabaseAdmin
    .from('mz_stands')
    .update(value)
    .eq('id', standId)
    .select('id, status, company_id')
    .maybeSingle();

  if (dbError || !data) {
    console.error('admin stands PATCH:', dbError);
    return Response.json({ ok: false, error: 'Fläche nicht gefunden.' }, { status: 400 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: value.company_id,
    user_id: auth.user.id,
    aktion: 'admin_stand_status',
    details: { stand: standId, status: value.status },
  });

  return Response.json({ ok: true, stand: data });
}
