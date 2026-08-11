import { supabaseAdmin } from '../../../../lib/supabase';
import { supabaseSession } from '../../../../lib/supabase-server';
import { isEmail, isLoginCode, normalizeEmail, normalizeLoginCode } from '../../../../lib/validate';
import { describeEnv } from '../../../../lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Шаг 2 входа: проверяем код и открываем сессию.
 *
 * Список допущенных сверяется ЗАНОВО, уже после проверки кода. Причина:
 * между запросом кода и его вводом проходит время, за которое сотрудника
 * могли убрать из списка. Код при этом остаётся действительным — значит
 * право входа надо подтверждать в момент входа, а не в момент отправки.
 */
export async function POST(request) {
  const env = describeEnv(process.env);
  if (!env.ok) {
    return Response.json({ ok: false, error: 'Portal ist nicht konfiguriert' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  if (!isEmail(body?.email)) {
    return Response.json({ ok: false, error: 'ungültige E-Mail-Adresse' }, { status: 400 });
  }
  const code = normalizeLoginCode(body?.code);
  if (!isLoginCode(code)) {
    return Response.json(
      { ok: false, error: 'Bitte geben Sie den Code aus der E-Mail ein — nur Ziffern.' },
      { status: 400 }
    );
  }
  const email = normalizeEmail(body.email);

  const supabase = supabaseSession();
  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });

  if (error || !data?.user) {
    // Неверный и просроченный код отвечаем одинаково: разница подсказала бы
    // подбирающему, что адрес существует и код когда-то был выслан.
    return Response.json(
      { ok: false, error: 'Code ungültig oder abgelaufen.' },
      { status: 401 }
    );
  }

  const user = data.user;

  const { data: allow, error: allowError } = await supabaseAdmin
    .from('mz_allowlist')
    .select('company_id, aktiv, rolle')
    .eq('email', email)
    .maybeSingle();

  if (allowError) {
    console.error('verify: не удалось прочитать список допущенных', allowError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  if (!allow || !allow.aktiv) {
    // Код верный, но права уже нет. Сессию не оставляем.
    await supabase.auth.signOut();
    return Response.json(
      { ok: false, error: 'Dieser Zugang ist nicht mehr aktiv.' },
      { status: 403 }
    );
  }

  const { error: memberError } = await supabaseAdmin
    .from('mz_company_members')
    .upsert(
      { user_id: user.id, company_id: allow.company_id, rolle: allow.rolle },
      { onConflict: 'user_id' }
    );

  if (memberError) {
    console.error('verify: не удалось привязать учётную запись к компании', memberError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  // Журнал ведём после успеха и не валим им вход: не записался — плохо,
  // но не повод не пускать человека.
  const { error: auditError } = await supabaseAdmin.from('mz_audit').insert({
    company_id: allow.company_id,
    user_id: user.id,
    aktion: 'login',
    details: { email },
  });
  if (auditError) console.error('verify: журнал не записался', auditError);

  return Response.json({ ok: true });
}
