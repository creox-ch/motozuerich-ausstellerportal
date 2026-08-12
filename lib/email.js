import { Resend } from 'resend';
import { replyTo, resolveRecipient, subjectWithOverrideHint } from './mail';

/**
 * Отправка писем портала.
 *
 * Клиент Resend создаётся лениво — по той же причине, что и клиент Supabase:
 * при сборке на Vercel переменных окружения нет, а конструктор требует ключ.
 *
 * Письмо не должно валить операцию, ради которой отправлялось. Поэтому функции
 * возвращают результат, а не бросают: решает вызывающий роут. Для кода входа
 * несостоявшаяся отправка — это провал операции, для уведомления нам — нет.
 */

let _resend = null;

function resend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('Resend не сконфигурирован: задай RESEND_API_KEY.');
    _resend = new Resend(key);
  }
  return _resend;
}

const DEFAULT_FROM = 'MOTO-ZÜRICH <noreply@motozuerich.ch>';

/** Экранирование пользовательских значений перед подстановкой в HTML. */
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Куда уходят уведомления о новых заявках. */
const DEFAULT_NOTIFY = 'yves@motozuerich.ch';

/**
 * Уведомление Messeleitung о новой заявке на площадь.
 *
 * Reply-To ставим адрес заявителя: ответить ему должно быть одним нажатием,
 * иначе почтовую переписку начинают вести мимо системы.
 */
export async function sendAnfrageNotification({ anfrage, stand, env = process.env }) {
  const to = env.PORTAL_NOTIFY_EMAIL || DEFAULT_NOTIFY;
  const recipient = resolveRecipient(to, env);

  const flaeche = stand ? `${stand.breite_m} × ${stand.tiefe_m} m, ${Math.round(Number(stand.flaeche_m2))} m²` : '—';
  const zeilen = [
    ['Stand', stand ? `${stand.id} · ${stand.halle} · ${stand.lage || '—'}` : 'keine Fläche gewählt'],
    ['Format', flaeche],
    ['Firma', anfrage.firma],
    ['Ansprechperson', anfrage.name],
    ['E-Mail', anfrage.email],
    ['Telefon', anfrage.telefon || '—'],
    ['Nachricht', anfrage.nachricht || '—'],
  ];

  const subject = subjectWithOverrideHint(
    `Standanfrage${stand ? ` ${stand.id}` : ''} · ${anfrage.firma}`,
    recipient
  );

  const text = zeilen.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html = `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#F4F7FC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#12253F">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #DCE4F0;border-radius:3px">
    <tr><td style="background:#0E1E37;padding:18px 22px;color:#fff;font-weight:700">Neue Standanfrage</td></tr>
    <tr><td style="padding:18px 22px">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px">
        ${zeilen
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 0;color:#63768F;width:150px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v)}</td></tr>`
          )
          .join('')}
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    const { error } = await resend().emails.send({
      from: env.PORTAL_FROM_EMAIL || DEFAULT_FROM,
      to: recipient.to,
      // Отвечать надо заявителю, а не в noreply.
      replyTo: anfrage.email,
      subject,
      text,
      html,
    });
    if (error) return { ok: false, error: error.message || 'Versand fehlgeschlagen' };
    return { ok: true };
  } catch (e) {
    console.error('sendAnfrageNotification: отправка упала', e);
    return { ok: false, error: 'Versand fehlgeschlagen' };
  }
}

/** Обрезка для превью в письме. Целиком читают в портале, не в почте. */
function auszug(text, max = 400) {
  const sauber = String(text || '').trim();
  return sauber.length > max ? `${sauber.slice(0, max)}…` : sauber;
}

/**
 * Уведомление Messeleitung: экспонент написал.
 *
 * Reply-To — адрес написавшего: ответить должно быть одним нажатием. Иначе
 * переписку начинают вести мимо портала, и в нём остаётся половина разговора.
 */
export async function sendNachrichtAnMesseleitung({ firma, autor, text, env = process.env }) {
  const to = env.PORTAL_NOTIFY_EMAIL || DEFAULT_NOTIFY;
  const recipient = resolveRecipient(to, env);
  const subject = subjectWithOverrideHint(`Nachricht von ${firma}`, recipient);

  const body = auszug(text);
  const html = `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#F4F7FC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#12253F">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #DCE4F0;border-radius:3px">
    <tr><td style="background:#0E1E37;padding:18px 22px;color:#fff;font-weight:700">Neue Nachricht im Ausstellerportal</td></tr>
    <tr><td style="padding:18px 22px;font-size:14px">
      <p style="margin:0 0 6px;color:#63768F">${escapeHtml(firma)} · ${escapeHtml(autor)}</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(body)}</p>
    </td></tr>
  </table>
</body></html>`;

  try {
    const { error } = await resend().emails.send({
      from: env.PORTAL_FROM_EMAIL || DEFAULT_FROM,
      to: recipient.to,
      replyTo: autor,
      subject,
      text: `${firma} · ${autor}\n\n${body}`,
      html,
    });
    if (error) return { ok: false, error: error.message || 'Versand fehlgeschlagen' };
    return { ok: true };
  } catch (e) {
    console.error('sendNachrichtAnMesseleitung: отправка упала', e);
    return { ok: false, error: 'Versand fehlgeschlagen' };
  }
}

/**
 * Уведомление экспоненту: Messeleitung ответила.
 *
 * Текст ответа в письмо не кладём целиком, а ведём в портал: переписка должна
 * оставаться в одном месте, иначе ответ уйдёт письмом и в портале повиснет
 * вопрос без ответа.
 */
export async function sendAntwortAnAussteller({ to, firma, env = process.env }) {
  const empfaenger = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (empfaenger.length === 0) return { ok: false, error: 'Kein Empfänger' };

  // Перехват проверяем по первому адресу: подмена одна на всё письмо.
  const recipient = resolveRecipient(empfaenger[0], env);
  const alle = recipient.overridden ? [recipient.to] : empfaenger;
  const subject = subjectWithOverrideHint('Antwort der Messeleitung', recipient);

  const text = [
    'Die Messeleitung hat Ihnen im Ausstellerportal geantwortet.',
    '',
    'Sie finden die Nachricht im Bereich «Nachrichten» in Ihrem Ausstellerkonto.',
    '',
    'MOTO-ZÜRICH 2027 · 19.–21. Februar 2027',
  ].join('\n');

  const html = `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#F4F7FC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#12253F">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #DCE4F0;border-radius:3px">
    <tr><td style="background:#0E1E37;padding:20px 24px">
      <div style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-.4px">MOTO-<span style="color:#FBF142">ZÜRICH</span></div>
      <div style="margin-top:5px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#93A9C6">Ausstellerportal</div>
    </td></tr>
    <tr><td style="padding:24px;font-size:14px">
      <p style="margin:0 0 12px">Die Messeleitung hat Ihnen geantwortet${firma ? ` (${escapeHtml(firma)})` : ''}.</p>
      <p style="margin:0;color:#63768F">Sie finden die Nachricht im Bereich «Nachrichten» in Ihrem Ausstellerkonto.</p>
    </td></tr>
  </table>
</body></html>`;

  try {
    const { error } = await resend().emails.send({
      from: env.PORTAL_FROM_EMAIL || DEFAULT_FROM,
      to: alle,
      replyTo: replyTo(env),
      subject,
      text,
      html,
    });
    if (error) return { ok: false, error: error.message || 'Versand fehlgeschlagen' };
    return { ok: true, overridden: recipient.overridden };
  } catch (e) {
    console.error('sendAntwortAnAussteller: отправка упала', e);
    return { ok: false, error: 'Versand fehlgeschlagen' };
  }
}

/**
 * Письмо с кодом входа.
 *
 * @returns {Promise<{ok: boolean, error?: string, overridden?: boolean}>}
 */
export async function sendLoginCode({ to, code, env = process.env }) {
  const recipient = resolveRecipient(to, env);

  const subject = subjectWithOverrideHint('Ihr Anmeldecode für das Ausstellerportal', recipient);
  const safeCode = escapeHtml(code);

  // Текстовая версия обязательна: без неё письмо выглядит для фильтров хуже,
  // а Resend соберёт текст из HTML сам и слепит слова.
  const text = [
    'Ihr Anmeldecode für das Ausstellerportal MOTO-ZÜRICH 2027:',
    '',
    code,
    '',
    'Der Code ist eine Stunde gültig und kann einmal verwendet werden.',
    'Wenn Sie diesen Code nicht angefordert haben, ignorieren Sie diese Nachricht.',
    '',
    'MOTO-ZÜRICH 2027 · 19.–21. Februar 2027',
    'StageOne und Halle 550, Zürich-Oerlikon',
  ].join('\n');

  const html = `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#F4F7FC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#12253F">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #DCE4F0;border-radius:3px">
    <tr><td style="background:#0E1E37;padding:20px 24px">
      <div style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-.4px">MOTO-<span style="color:#FBF142">ZÜRICH</span></div>
      <div style="margin-top:5px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#93A9C6">Ausstellerportal</div>
    </td></tr>
    <tr><td style="padding:24px">
      <p style="margin:0 0 16px">Ihr Anmeldecode:</p>
      <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:.18em;font-family:monospace">${safeCode}</p>
      <p style="margin:0 0 8px;color:#63768F;font-size:13px">Der Code ist eine Stunde gültig und kann einmal verwendet werden.</p>
      <p style="margin:0;color:#63768F;font-size:13px">Wenn Sie diesen Code nicht angefordert haben, ignorieren Sie diese Nachricht.</p>
    </td></tr>
    <tr><td style="padding:0 24px 22px;color:#63768F;font-size:12px;border-top:1px solid #DCE4F0">
      <p style="margin:14px 0 0">MOTO-ZÜRICH 2027 · 19.–21. Februar 2027<br>StageOne und Halle 550, Zürich-Oerlikon</p>
    </td></tr>
  </table>
</body></html>`;

  try {
    const { error } = await resend().emails.send({
      from: env.PORTAL_FROM_EMAIL || DEFAULT_FROM,
      to: recipient.to,
      replyTo: replyTo(env),
      subject,
      text,
      html,
    });
    if (error) {
      console.error('sendLoginCode: Resend вернул ошибку', error);
      return { ok: false, error: error.message || 'Versand fehlgeschlagen' };
    }
    return { ok: true, overridden: recipient.overridden };
  } catch (e) {
    console.error('sendLoginCode: отправка упала', e);
    return { ok: false, error: 'Versand fehlgeschlagen' };
  }
}
