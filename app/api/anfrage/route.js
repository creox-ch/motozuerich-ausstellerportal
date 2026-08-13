import { cookies } from 'next/headers';
import { supabaseAdmin } from '../../../lib/supabase';
import { describeEnv } from '../../../lib/env';
import { validateAnfrage } from '../../../lib/anfrage';
import { PREIS_COOKIE } from '../../../lib/preisgate';
import { sendAnfrageBestaetigung, sendAnfrageNotification } from '../../../lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FIELD = 2000;

/**
 * Заявка на площадь с публичной страницы.
 *
 * Проверка полей вынесена в lib/anfrage.js: она сложнее одного `if` и должна
 * быть покрыта тестами без поднятия роута.
 *
 * Порядок остальных шагов выстрадан и менять его не надо: конфигурация →
 * разбор тела → ловушки для ботов → согласие → запись → письма. Письма
 * последними, потому что они не должны валить уже сохранённую заявку.
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

  const geprueft = validateAnfrage(body);
  if (!geprueft.ok) {
    // Ботам отвечаем «ок»: если сказать «отклонено», автор скрипта поправит
    // его и придёт снова. Молчаливый отказ выглядит для него успехом.
    if (geprueft.bot) return Response.json({ ok: true, skipped: true });
    return Response.json({ ok: false, error: geprueft.error }, { status: 400 });
  }
  const value = geprueft.value;

  // Площадку сверяем с каталогом: подставить чужой или выдуманный id нельзя.
  // Заявка без площадки — нормальный случай: зал ещё не размечен, а человек
  // уже готов говорить.
  const standId = typeof body.stand_id === 'string' ? body.stand_id.trim().slice(0, 40) : '';
  let stand = null;
  if (standId) {
    const { data } = await supabaseAdmin
      .from('mz_stands')
      .select('id, halle, lage, breite_m, tiefe_m, flaeche_m2, status')
      .eq('id', standId)
      .maybeSingle();
    stand = data || null;
  }

  const { data: saved, error } = await supabaseAdmin
    .from('mz_anfragen')
    .insert({
      ...value,
      stand_id: stand?.id || null,
      // Источник разбирает сервер: значению из браузера тут доверять нечего.
      quelle: parseSource(body.source_url),
    })
    .select('id')
    .single();

  if (error) {
    console.error('anfrage: не удалось сохранить', error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  // Если человек раньше открывал цены, связываем два события. Это вся воронка,
  // какая нам нужна: сколько контактов оставили, сколько дошли до заявки.
  await verknuepfeMitPreisinteresse(saved.id, value.email);

  // Оба письма — после записи и без права её откатить.
  const [nachricht, bestaetigung] = await Promise.all([
    sendAnfrageNotification({ anfrage: { id: saved.id, ...value }, stand }),
    sendAnfrageBestaetigung({ to: value.email, firma: value.firma, stand }),
  ]);
  if (!nachricht.ok) console.error('anfrage: уведомление не ушло', nachricht.error);
  if (!bestaetigung.ok) console.error('anfrage: подтверждение не ушло', bestaetigung.error);

  return Response.json({ ok: true });
}

/**
 * Связать заявку с оставленным ранее контактом.
 *
 * Ищем сначала по cookie — она точная. Если её нет (человек оставил почту
 * с телефона, а заявку заполнил с ноутбука), ищем по адресу.
 */
async function verknuepfeMitPreisinteresse(anfrageId, email) {
  const ausCookie = cookies().get(PREIS_COOKIE)?.value;

  if (ausCookie && /^[0-9a-f-]{36}$/i.test(ausCookie)) {
    const { data } = await supabaseAdmin
      .from('mz_preis_interesse')
      .update({ anfrage_id: anfrageId })
      .eq('id', ausCookie)
      .is('anfrage_id', null)
      .select('id')
      .maybeSingle();
    if (data) return;
  }

  await supabaseAdmin
    .from('mz_preis_interesse')
    .update({ anfrage_id: anfrageId })
    .eq('email', email)
    .is('anfrage_id', null);
}

/** UTM и адрес страницы — для понимания, откуда пришёл лид. */
function parseSource(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const url = new URL(raw);
    const quelle = { landing: url.origin + url.pathname };
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const value = url.searchParams.get(key);
      if (value) quelle[key] = value.slice(0, MAX_FIELD);
    }
    return quelle;
  } catch {
    return null;
  }
}
