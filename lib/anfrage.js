import { isEmail, normalizeEmail } from './validate';
import { KATEGORIEN } from './profile';

/**
 * Заявка на площадь с публичной витрины.
 *
 * Поля повторяют то, что Messeleitung заполняла в Pyrus: компания, бренды,
 * категория, зона, контакт, площадь, комментарий. Смысл не в полноте анкеты,
 * а в квалификации: по этим полям видно, кто пришёл, и можно ли говорить
 * предметно на первом же звонке.
 *
 * Каждое лишнее поле снижает конверсию, поэтому обязательных ровно четыре —
 * компания, контактное лицо, почта и согласие. Остальное помогает, но
 * не мешает отправить.
 */

/** Зоны выставки. Нужны, когда конкретная площадка ещё не выбрана. */
export const ZONEN = [
  'Adventure Camp (Halle D)',
  'Halle 550',
  'StageOne',
  'noch offen',
];

export { KATEGORIEN };

const MAX_FELD = 2000;
const MAX_MARKEN = 30;
const MAX_MARKE_LEN = 60;

function str(value, max = MAX_FELD) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Бренды приходят одной строкой через запятую — так их и вводят люди.
 * Разбирает сервер: в браузере можно вставить что угодно, включая перевод
 * строки вместо запятой.
 */
export function parseMarken(raw) {
  if (Array.isArray(raw)) return bereinigeMarken(raw);
  if (typeof raw !== 'string') return [];
  return bereinigeMarken(raw.split(/[,;\n]/));
}

function bereinigeMarken(liste) {
  const gesehen = new Set();
  const marken = [];
  for (const eintrag of liste) {
    const marke = str(eintrag, MAX_MARKE_LEN);
    if (!marke) continue;
    const schluessel = marke.toLowerCase();
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    marken.push(marke);
    if (marken.length >= MAX_MARKEN) break;
  }
  return marken;
}

/**
 * Проверка заявки.
 *
 * Ботов отсекаем ДО разбора полей и сообщаем им «ок»: скажешь «отклонено» —
 * автор скрипта поправит его и придёт снова, а молчаливый отказ выглядит
 * для него успехом.
 *
 * @returns {{ok: true, value: object}
 *          |{ok: false, bot: true}
 *          |{ok: false, error: string}}
 */
export function validateAnfrage(input = {}) {
  if (str(input.website)) return { ok: false, bot: true };

  const elapsed = Number(input.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed < 2500) {
    return { ok: false, bot: true };
  }

  const firma = str(input.firma, 120);
  const name = str(input.name, 120);
  if (!firma || !name) {
    return { ok: false, error: 'Bitte geben Sie Firma und Ansprechperson an.' };
  }

  const email = normalizeEmail(input.email);
  if (!isEmail(email)) {
    return { ok: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' };
  }

  if (input.consent !== true && input.consent !== 'true') {
    return { ok: false, error: 'Ohne Ihre Einwilligung können wir die Anfrage nicht bearbeiten.' };
  }

  const kategorie = str(input.kategorie, 60);
  if (kategorie && !KATEGORIEN.includes(kategorie)) {
    return { ok: false, error: 'Unbekannte Kategorie.' };
  }

  const zone = str(input.zone, 60);
  if (zone && !ZONEN.includes(zone)) {
    return { ok: false, error: 'Unbekannte Zone.' };
  }

  return {
    ok: true,
    value: {
      firma,
      name,
      email,
      telefon: str(input.telefon, 60),
      nachricht: str(input.nachricht),
      kategorie: kategorie || null,
      zone: zone || null,
      marken: parseMarken(input.marken),
      consent: true,
      marketing_consent:
        input.marketing_consent === true || input.marketing_consent === 'true',
    },
  };
}
