import { isEmail, normalizeEmail } from './validate';

/**
 * «Почта за цену» — обмен контакта на показ цен на витрине.
 *
 * ЧЕСТНО О ТОМ, ЧТО ЭТО ТАКОЕ. Это сбор контактов, а не защита. Cookie можно
 * подставить руками, ответ роута — прочитать. Мы меняем цену на контакт,
 * а не охраняем секрет: прайс всё равно уйдёт экспоненту в оферте.
 *
 * Поэтому единственное требование к механике — не отдавать цену в разметку
 * до того, как контакт оставлен. Гейт, прячущий цену стилями, обходится
 * за две секунды и злит ровно того покупателя, которого мы хотим.
 *
 * ПОЧЕМУ СПРАШИВАЕМ И КОМПАНИЮ. Продажа стенда — B2B: адрес `info@` не говорит
 * ни о чём, а «Hostettler Moto AG» говорит всё. Название компании стоит одного
 * лишнего поля и превращает список почт в список, с которым можно работать.
 */

/** Имя cookie. В ней лежит id строки интереса — он же связывает с заявкой. */
export const PREIS_COOKIE = 'mz_preis_zugang';

/** Сколько цены остаются открытыми. Решение принимают месяцами, не за вечер. */
export const PREIS_COOKIE_TAGE = 90;

/** Быстрее человек форму не заполнит. Значение общее с формой заявки. */
export const MIN_FILL_MS = 2500;

function str(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Проверка запроса на показ цен.
 *
 * Ботов отличаем от людей ДО проверки полей: скрипту, заполнившему ловушку,
 * незачем знать, что именно ему не понравилось.
 *
 * @returns {{ok: true, value: object}
 *          |{ok: false, bot: true}
 *          |{ok: false, error: string}}
 */
export function validateFreischaltung(input = {}) {
  // Ловушка: поле скрыто от человека, заполнить его мог только скрипт.
  if (str(input.website)) return { ok: false, bot: true };

  const elapsed = Number(input.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed < MIN_FILL_MS) {
    return { ok: false, bot: true };
  }

  const email = normalizeEmail(input.email);
  if (!isEmail(email)) {
    return { ok: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' };
  }

  const firma = str(input.firma, 120);
  if (!firma) {
    return { ok: false, error: 'Bitte geben Sie Ihre Firma an.' };
  }

  // Согласие на обработку обязательно: это персональные данные, собранные
  // до всякого договора.
  if (input.consent !== true && input.consent !== 'true') {
    return { ok: false, error: 'Ohne Ihre Einwilligung können wir die Preise nicht anzeigen.' };
  }

  return {
    ok: true,
    value: {
      email,
      firma,
      // Согласие на новости — отдельное и добровольное. Его отсутствие
      // не мешает показать цену.
      marketing_consent: input.marketing_consent === true || input.marketing_consent === 'true',
      stand_id: str(input.stand_id, 40) || null,
    },
  };
}
