import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { validateAnfrageUpdate } from '../../../../lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Статус заявки с витрины и внутренняя пометка. */
export async function PATCH(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!id) return Response.json({ ok: false, error: 'Anfrage fehlt.' }, { status: 400 });

  const { ok, error, value } = validateAnfrageUpdate(body);
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  const { data, error: dbError } = await supabaseAdmin
    .from('mz_anfragen')
    .update(value)
    .eq('id', id)
    .select('id, status')
    .maybeSingle();

  if (dbError || !data) {
    return Response.json({ ok: false, error: 'Anfrage nicht gefunden.' }, { status: 400 });
  }

  return Response.json({ ok: true, anfrage: data });
}
