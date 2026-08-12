import { supabaseAdmin } from '../../../../lib/supabase';
import { sendLoginCode } from '../../../../lib/email';
import { isEmail, normalizeEmail } from '../../../../lib/validate';
import { describeEnv } from '../../../../lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Минимальный интервал между кодами на один адрес, секунды. */
const MIN_INTERVAL_S = 60;

/**
 * Шаг 1 входа: человек назвал почту — отправляем код, если он допущен.
 *
 * Порядок проверок важен: всё, что можно отбить без обращений наружу,
 * отбиваем раньше — конфигурация, разбор тела, формат адреса. Только потом
 * идём в базу и в почтовый сервис.
 *
 * Про честный ответ «адрес не допущен». Он позволяет узнать, есть ли компания
 * в списке. Мы идём на это сознательно: состав экспонентов и так публичен
 * (каталог, Event-Guide, план залов), а человек, которому не приходит код без
 * объяснений, звонит в Messeleitung — и это дороже, чем скрытая информация,
 * которая всё равно не секрет.
 */
export async function POST(request) {
  const env = describeEnv(process.env);
  if (!env.ok) {
    return Response.json(
      { ok: false, error: 'Portal ist nicht konfiguriert' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  if (!isEmail(body?.email)) {
    return Response.json(
      { ok: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
      { status: 400 }
    );
  }
  const email = normalizeEmail(body.email);

  // Допущен ли адрес — как экспонент или как сотрудник Messeleitung.
  // Вход один на всех, различие только в том, куда человек попадёт после.
  const [{ data: allow, error: allowError }, { data: staff, error: staffError }] =
    await Promise.all([
      supabaseAdmin
        .from('mz_allowlist')
        .select('company_id, aktiv, letzter_code_am')
        .eq('email', email)
        .maybeSingle(),
      supabaseAdmin.from('mz_staff').select('email, aktiv').eq('email', email).maybeSingle(),
    ]);

  if (allowError || staffError) {
    console.error('request-code: не удалось прочитать доступы', allowError || staffError);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  const istExponent = Boolean(allow?.aktiv);
  const istStaff = Boolean(staff?.aktiv);

  if (!istExponent && !istStaff) {
    return Response.json({ ok: true, allowed: false });
  }

  // Защита от рассылки кодов на чужой адрес: письма уходят с нашего домена,
  // и спам ими бьёт по репутации отправителя, а не только по человеку.
  // Для персонала отметки времени нет — их несколько человек, и защита
  // важнее для адресов, которые может назвать посторонний.
  if (allow?.letzter_code_am) {
    const seit = (Date.now() - new Date(allow.letzter_code_am).getTime()) / 1000;
    if (seit < MIN_INTERVAL_S) {
      return Response.json(
        {
          ok: false,
          error: 'Bitte warten Sie einen Moment, bevor Sie einen neuen Code anfordern.',
          retryAfter: Math.ceil(MIN_INTERVAL_S - seit),
        },
        { status: 429 }
      );
    }
  }

  // Учётная запись заводится при первом запросе кода. Автосоздание на стороне
  // Supabase отключено бы не помогло: сюда мы попадаем только после проверки
  // списка допущенных, то есть создаём запись лишь для приглашённых.
  let otp = await generateOtp(email);
  if (!otp.ok && otp.userMissing) {
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createError) {
      console.error('request-code: не удалось создать учётную запись', createError);
      return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
    }
    otp = await generateOtp(email);
  }

  if (!otp.ok) {
    console.error('request-code: не удалось получить код', otp.error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  const sent = await sendLoginCode({ to: email, code: otp.code });
  if (!sent.ok) {
    // Здесь письмо — это и есть операция. Молчаливое «ок» оставило бы человека
    // ждать код, которого не будет.
    return Response.json(
      { ok: false, error: 'Der Code konnte nicht versendet werden. Bitte melden Sie sich bei der Messeleitung.' },
      { status: 502 }
    );
  }

  if (istExponent) {
    await supabaseAdmin
      .from('mz_allowlist')
      .update({ letzter_code_am: new Date().toISOString() })
      .eq('email', email);
  }

  return Response.json({ ok: true, allowed: true });
}

/**
 * Код получаем у Supabase, но письмо отправляем сами через Resend.
 * Встроенная отправка Supabase имеет жёсткие лимиты и чужое оформление —
 * на пике регистрации вход просто перестал бы работать.
 */
async function generateOtp(email) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error) {
    const missing = /not found|no user|user_not_found/i.test(error.message || '');
    return { ok: false, error, userMissing: missing };
  }

  const code = data?.properties?.email_otp;
  if (!code) return { ok: false, error: new Error('Supabase не вернул код') };

  return { ok: true, code };
}
