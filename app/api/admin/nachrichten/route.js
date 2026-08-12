import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { empfaengerDerCompany, validateNachricht } from '../../../../lib/nachrichten';
import { sendAntwortAnAussteller } from '../../../../lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Messeleitung отвечает экспоненту. */
export async function POST(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const companyId = typeof body.company_id === 'string' ? body.company_id.trim() : '';
  if (!/^[0-9a-f-]{36}$/i.test(companyId)) {
    return Response.json({ ok: false, error: 'Firma ist nicht ausgewählt.' }, { status: 400 });
  }

  const { ok, error, value } = validateNachricht(body);
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  const { data: company } = await supabaseAdmin
    .from('mz_companies')
    .select('id, name')
    .eq('id', companyId)
    .maybeSingle();

  if (!company) {
    return Response.json({ ok: false, error: 'Firma nicht gefunden.' }, { status: 400 });
  }

  const { data: row, error: dbError } = await supabaseAdmin
    .from('mz_nachrichten')
    .insert({
      company_id: companyId,
      von: 'messeleitung',
      autor_email: auth.email,
      user_id: auth.user.id,
      text: value.text,
    })
    .select('id, created_at, von, autor_email, text')
    .maybeSingle();

  if (dbError || !row) {
    console.error('admin nachrichten POST: не удалось записать', dbError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  // Уведомление уходит всем, у кого есть доступ от этой компании: кто именно
  // задал вопрос, знать неоткуда, а ответ касается фирмы целиком.
  const empfaenger = await empfaengerDerCompany(companyId);
  if (empfaenger.length > 0) {
    const mail = await sendAntwortAnAussteller({ to: empfaenger, firma: company.name });
    if (!mail.ok) console.error('admin nachrichten POST: уведомление не ушло', mail.error);
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: companyId,
    user_id: auth.user.id,
    aktion: 'nachricht_beantwortet',
    details: { id: row.id },
  });

  return Response.json({ ok: true, nachricht: row, empfaenger: empfaenger.length });
}
