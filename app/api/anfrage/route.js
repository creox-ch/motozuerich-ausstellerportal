import { supabaseAdmin } from '../../../lib/supabase';
import { isEmail, normalizeEmail } from '../../../lib/validate';
import { describeEnv } from '../../../lib/env';
import { sendAnfrageNotification } from '../../../lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Быстрее человек форму не заполнит. Значение как на остальных формах платформы. */
const MIN_FILL_MS = 2500;
const MAX_FIELD = 2000;

/**
 * Заявка на площадь с публичной страницы.
 *
 * Порядок проверок повторяет общий эндпоинт форм платформы, и не случайно:
 * он выстрадан. Сначала конфигурация, потом разбор тела, потом ловушки для
 * ботов — и только в конце согласие и запись.
 *
 * Ботам отвечаем «ок»: если сказать «отклонено», автор скрипта поправит его
 * и придёт снова. Молчаливый отказ выглядит для него успехом.
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

  // Ловушка: поле скрыто от человека, заполнить его мог только скрипт.
  if (String(body.website || '').trim()) {
    return Response.json({ ok: true, skipped: true });
  }

  // Форму, заполненную быстрее двух с половиной секунд, человек не заполнял.
  const elapsed = Number(body.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed < MIN_FILL_MS) {
    return Response.json({ ok: true, skipped: true });
  }

  const firma = trim(body.firma);
  const name = trim(body.name);
  const email = normalizeEmail(body.email);

  if (!firma || !name) {
    return Response.json(
      { ok: false, error: 'Bitte geben Sie Firma und Ansprechperson an.' },
      { status: 400 }
    );
  }
  if (!isEmail(email)) {
    return Response.json(
      { ok: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
      { status: 400 }
    );
  }

  // Без согласия заявку не сохраняем вовсе. Момент согласия — created_at строки.
  if (body.consent !== true && body.consent !== 'true') {
    return Response.json(
      { ok: false, error: 'Ohne Ihre Einwilligung können wir die Anfrage nicht bearbeiten.' },
      { status: 400 }
    );
  }

  // Площадку сверяем с каталогом: подставить чужой или выдуманный id нельзя.
  const standId = trim(body.stand_id);
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
      stand_id: stand?.id || null,
      firma,
      name,
      email,
      telefon: trim(body.telefon),
      nachricht: trim(body.nachricht),
      consent: true,
      // Источник разбирает сервер: значению из браузера тут доверять нечего.
      quelle: parseSource(body.source_url),
    })
    .select('id')
    .single();

  if (error) {
    console.error('anfrage: не удалось сохранить', error);
    return Response.json({ ok: false, error: 'interner Fehler' }, { status: 500 });
  }

  // Письмо не валит уже сохранённую заявку: она в базе, а уведомление можно
  // и восстановить. Обратный порядок означал бы терять лиды из-за почты.
  const sent = await sendAnfrageNotification({
    anfrage: { id: saved.id, firma, name, email, telefon: trim(body.telefon), nachricht: trim(body.nachricht) },
    stand,
  });
  if (!sent.ok) console.error('anfrage: уведомление не ушло', sent.error);

  return Response.json({ ok: true });
}

function trim(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD) : '';
}

/** UTM и адрес страницы — для понимания, откуда пришёл лид. */
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
