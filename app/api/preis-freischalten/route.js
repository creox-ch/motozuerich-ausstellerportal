import { cookies } from 'next/headers';
import { supabaseAdmin } from '../../../lib/supabase';
import { describeEnv } from '../../../lib/env';
import { PREIS_COOKIE, PREIS_COOKIE_TAGE, validateFreischaltung } from '../../../lib/preisgate';
import { formatPrice, leistungenInklusive, loadPriceRules, priceFor } from '../../../lib/pricing';
import { sendPreiseFreigeschaltet } from '../../../lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Показать цены в обмен на контакт.
 *
 * Порядок проверок тот же, что в /api/anfrage: конфигурация → ловушки для
 * ботов → поля → согласие → запись. Ботам отвечаем «ок»: скажешь «отклонено» —
 * автор скрипта поправит его и придёт снова.
 */
export async function POST(request) {
  if (!describeEnv(process.env).ok) {
    return Response.json({ ok: false, error: 'Portal ist nicht konfiguriert' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'ungültige Anfrage' }, { status: 400 });
  }

  const geprueft = validateFreischaltung(body);
  if (!geprueft.ok) {
    if (geprueft.bot) return Response.json({ ok: true, skipped: true });
    return Response.json({ ok: false, error: geprueft.error }, { status: 400 });
  }
  const { email, firma, marketing_consent, stand_id } = geprueft.value;

  // Площадку сверяем с каталогом: подставить выдуманный id нельзя.
  let stand = null;
  if (stand_id) {
    const { data } = await supabaseAdmin
      .from('mz_stands')
      .select('id, halle, breite_m, tiefe_m, flaeche_m2')
      .eq('id', stand_id)
      .maybeSingle();
    stand = data || null;
  }

  // Дедупликация. Один человек оставляет почту с телефона, с ноутбука и ещё
  // раз через неделю. Без склейки Messeleitung получает список, которому
  // не верит, и перестаёт им пользоваться.
  const { data: vorhanden } = await supabaseAdmin
    .from('mz_preis_interesse')
    .select('id, firma, marketing_consent')
    .eq('email', email)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  let zeileId = vorhanden?.id || null;

  if (vorhanden) {
    // Согласие на новости только ВКЛЮЧАЕМ повторным визитом, никогда
    // не выключаем: отказ оформляется отпиской, а не тем, что человек
    // во второй раз не поставил галочку.
    const patch = {};
    if (!vorhanden.firma && firma) patch.firma = firma;
    if (marketing_consent && !vorhanden.marketing_consent) patch.marketing_consent = true;
    if (stand?.id) patch.stand_id = stand.id;

    if (Object.keys(patch).length > 0) {
      await supabaseAdmin.from('mz_preis_interesse').update(patch).eq('id', vorhanden.id);
    }
  } else {
    const { data: neu, error } = await supabaseAdmin
      .from('mz_preis_interesse')
      .insert({
        email,
        firma,
        marketing_consent,
        stand_id: stand?.id || null,
        consent: true,
        quelle: parseSource(body.source_url),
      })
      .select('id')
      .single();

    if (error) {
      console.error('preis-freischalten: не удалось сохранить', error);
      return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
    }
    zeileId = neu.id;
  }

  // Cookie хранит идентификатор строки, а не просто «да»: он же свяжет
  // человека с заявкой, когда тот до неё дойдёт, и покажет воронку.
  cookies().set(PREIS_COOKIE, zeileId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: PREIS_COOKIE_TAGE * 24 * 60 * 60,
  });

  // Письмо не валит операцию: цены уже открыты, а неотправленное письмо —
  // потерянное второе касание, но не потерянный контакт.
  const rules = await loadPriceRules();
  const mail = await sendPreiseFreigeschaltet({
    to: email,
    firma,
    stand,
    preis: stand ? formatPrice(priceFor(stand, rules)) : null,
    inklusive: stand ? leistungenInklusive(stand.halle) : [],
  });
  if (!mail.ok) console.error('preis-freischalten: письмо не ушло', mail.error);

  return Response.json({ ok: true });
}

/** UTM и адрес страницы — чтобы понимать, откуда пришёл лид. */
function parseSource(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const url = new URL(raw);
    const quelle = { landing: url.origin + url.pathname };
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const value = url.searchParams.get(key);
      if (value) quelle[key] = value.slice(0, 200);
    }
    return quelle;
  } catch {
    return null;
  }
}
