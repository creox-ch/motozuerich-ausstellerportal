import { requireCompany } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';
import { validateNachricht } from '../../../lib/nachrichten';
import { sendNachrichtAnMesseleitung } from '../../../lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Экспонент пишет Messeleitung.
 *
 * Компания берётся из сессии, а не из тела запроса: иначе подстановка чужого
 * идентификатора положила бы сообщение в чужую переписку.
 */
export async function POST(request) {
  const auth = await requireCompany();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const { ok, error, value } = validateNachricht(body);
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  const { data: row, error: dbError } = await supabaseAdmin
    .from('mz_nachrichten')
    .insert({
      company_id: auth.companyId,
      von: 'aussteller',
      autor_email: auth.user.email,
      user_id: auth.user.id,
      text: value.text,
    })
    .select('id, created_at, von, autor_email, text')
    .maybeSingle();

  if (dbError || !row) {
    console.error('nachrichten POST: не удалось записать', dbError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  const { data: company } = await supabaseAdmin
    .from('mz_companies')
    .select('name')
    .eq('id', auth.companyId)
    .maybeSingle();

  // Письмо не валит операцию: сообщение уже сохранено и видно в админке.
  // Не ушедшее уведомление — задержка ответа, откат сохранения — потерянный
  // человеком текст.
  const mail = await sendNachrichtAnMesseleitung({
    firma: company?.name || 'Aussteller',
    autor: auth.user.email,
    text: value.text,
  });
  if (!mail.ok) console.error('nachrichten POST: уведомление не ушло', mail.error);

  return Response.json({ ok: true, nachricht: row });
}
