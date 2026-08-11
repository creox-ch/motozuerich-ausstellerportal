/**
 * Адресация писем портала.
 *
 * Чистые функции без обращения к process.env — окружение передаётся аргументом,
 * чтобы кейсы можно было задать тестами, а не воспроизводить на машине.
 *
 * Зачем нужен перехват получателя. На preview-деплоях и локально код работает
 * с теми же данными и теми же адресами, что на проде. Без перехвата первый же
 * прогон «проверю, как выглядит письмо» уходит настоящему экспоненту с чужого
 * окружения. Поэтому в непроизводственных окружениях задаётся
 * PORTAL_MAIL_OVERRIDE, и ВСЕ письма идут на него.
 *
 * Перехват включается явной переменной, а не «по умолчанию, если не прод»:
 * молчаливое включение однажды съест боевую почту, и никто не заметит.
 */

/** Ответы экспонентов должны приходить живому человеку, а не в noreply. */
export const DEFAULT_REPLY_TO = 'yves@motozuerich.ch';

/** Пустая строка и пробелы — это «не задано», а не значение. */
function value(raw) {
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;
}

/**
 * Адрес для Reply-To в письмах портала.
 * @param {Record<string, string|undefined>} env
 */
export function replyTo(env = {}) {
  return value(env.PORTAL_REPLY_TO) || DEFAULT_REPLY_TO;
}

/**
 * Куда реально отправлять письмо.
 *
 * @param {string} intended адрес настоящего получателя
 * @param {Record<string, string|undefined>} env
 * @returns {{to: string, intended: string, overridden: boolean}}
 */
export function resolveRecipient(intended, env = {}) {
  const target = value(intended);
  if (!target) {
    throw new Error('resolveRecipient: не задан адрес получателя');
  }

  const override = value(env.PORTAL_MAIL_OVERRIDE);
  if (!override) {
    return { to: target, intended: target, overridden: false };
  }

  return { to: override, intended: target, overridden: true };
}

/**
 * Пометка для темы письма, когда получатель перехвачен. Без неё в тестовом
 * ящике лежит письмо, по которому не понять, кому оно предназначалось.
 */
export function subjectWithOverrideHint(subject, resolved) {
  if (!resolved?.overridden) return subject;
  return `[TEST → ${resolved.intended}] ${subject}`;
}
