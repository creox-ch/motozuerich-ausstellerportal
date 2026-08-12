import { requireStaff } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabase';
import { validateZugang } from '../../../../lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Выдать доступ: адрес почты → компания.
 *
 * Компания проверяется на существование ДО записи. Без этой проверки строка
 * с несуществующим идентификатором отвалилась бы по внешнему ключу с
 * непонятной человеку ошибкой базы, а с существующим, но чужим — тихо
 * пустила бы человека не туда.
 */
export async function POST(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const { ok, error, value } = validateZugang(body);
  if (!ok) return Response.json({ ok: false, error }, { status: 400 });

  const { data: company } = await supabaseAdmin
    .from('mz_companies')
    .select('id, name')
    .eq('id', value.company_id)
    .maybeSingle();

  if (!company) {
    return Response.json({ ok: false, error: 'Firma nicht gefunden.' }, { status: 400 });
  }

  const { error: dbError } = await supabaseAdmin
    .from('mz_allowlist')
    .upsert({ ...value, aktiv: true }, { onConflict: 'email' });

  if (dbError) {
    console.error('admin zugang POST:', dbError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: company.id,
    user_id: auth.user.id,
    aktion: 'admin_zugang_erteilt',
    details: { email: value.email, firma: company.name },
  });

  return Response.json({ ok: true, firma: company.name });
}

/** Закрыть или вернуть доступ. Строку не удаляем — история остаётся. */
export async function PATCH(request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) return Response.json({ ok: false, error: 'E-Mail fehlt.' }, { status: 400 });

  const aktiv = body.aktiv === true;

  const { data, error } = await supabaseAdmin
    .from('mz_allowlist')
    .update({ aktiv })
    .eq('email', email)
    .select('email, company_id, aktiv')
    .maybeSingle();

  if (error || !data) {
    return Response.json({ ok: false, error: 'Zugang nicht gefunden.' }, { status: 400 });
  }

  await supabaseAdmin.from('mz_audit').insert({
    company_id: data.company_id,
    user_id: auth.user.id,
    aktion: aktiv ? 'admin_zugang_aktiviert' : 'admin_zugang_gesperrt',
    details: { email },
  });

  return Response.json({ ok: true, aktiv: data.aktiv });
}
