import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { STATUS } from '../../../../lib/marketing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Messeleitung ведёт статус заявки. */
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
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json({ ok: false, error: 'Anfrage nicht gefunden.' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status.trim() : '';
  if (!STATUS.includes(status)) {
    return Response.json({ ok: false, error: 'Unbekannter Status.' }, { status: 400 });
  }

  const notiz = typeof body.notiz_intern === 'string' ? body.notiz_intern.trim().slice(0, 2000) : '';

  const { data, error } = await supabaseAdmin
    .from('mz_marketing_anfragen')
    .update({ status, ...(notiz ? { notiz_intern: notiz } : {}) })
    .eq('id', id)
    .select('id, company_id, status')
    .maybeSingle();

  if (error || !data) {
    return Response.json({ ok: false, error: 'Anfrage nicht gefunden.' }, { status: 400 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: data.company_id,
    user_id: auth.user.id,
    aktion: 'marketing_anfrage_status',
    details: { id, status },
  });

  return Response.json({ ok: true, status: data.status });
}
