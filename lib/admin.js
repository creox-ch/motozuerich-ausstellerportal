import { isEmail, normalizeEmail } from './validate';

/**
 * Правила операций Messeleitung.
 *
 * Чистые функции: проверяют ввод, ничего не пишут. Роут применяет их до
 * обращения к базе.
 *
 * Смысл этого модуля — не удобство, а снятие конкретного риска. До админки
 * доступ выдавался вставкой строки с идентификатором компании, скопированным
 * глазами. Опечатка в нём пускает человека в кабинет чужой компании, и ничто
 * этого не ловит: строка валидна, ключ существует, портал работает. Здесь
 * идентификатор выбирается из списка, а руками вводится только почта.
 */

export const COMPANY_STATUS = ['interessent', 'angemeldet', 'bestaetigt', 'abgesagt'];
export const STAND_STATUS = ['frei', 'reserviert', 'vergeben', 'gesperrt'];
export const ANFRAGE_STATUS = [
  'neu',
  'in_bearbeitung',
  'offeriert',
  'gewonnen',
  'verloren',
  'spam',
];

function str(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Новая компания. Обязательно только название — остальное экспонент заполнит сам. */
export function validateNewCompany(input = {}) {
  const name = str(input.name, 120);
  if (!name) return { ok: false, error: 'Firmenname ist erforderlich.' };

  const status = str(input.status);
  if (status && !COMPANY_STATUS.includes(status)) {
    return { ok: false, error: 'Unbekannter Status.' };
  }

  return {
    ok: true,
    value: {
      name,
      status: status || 'interessent',
      kontakt_name: str(input.kontakt_name),
      kontakt_tel: str(input.kontakt_tel),
      rechnungs_email: isEmail(input.rechnungs_email)
        ? normalizeEmail(input.rechnungs_email)
        : '',
    },
  };
}

/**
 * Выдача доступа: почта + компания.
 *
 * Идентификатор компании обязателен и проверяется на формат, но главное —
 * в интерфейсе он выбирается из списка, а не вводится. Здесь только последний
 * рубеж на случай запроса мимо формы.
 */
export function validateZugang(input = {}) {
  if (!isEmail(input.email)) {
    return { ok: false, error: 'Bitte eine gültige E-Mail-Adresse angeben.' };
  }
  const companyId = str(input.company_id, 40);
  if (!/^[0-9a-f-]{36}$/i.test(companyId)) {
    return { ok: false, error: 'Firma ist nicht ausgewählt.' };
  }
  const rolle = str(input.rolle) || 'mitarbeiter';
  if (!['inhaber', 'mitarbeiter'].includes(rolle)) {
    return { ok: false, error: 'Unbekannte Rolle.' };
  }

  return {
    ok: true,
    value: {
      email: normalizeEmail(input.email),
      company_id: companyId,
      rolle,
      notiz: str(input.notiz, 500),
    },
  };
}

/** Смена статуса площадки. Компания может быть снята — тогда null. */
export function validateStandUpdate(input = {}) {
  const status = str(input.status);
  if (!STAND_STATUS.includes(status)) {
    return { ok: false, error: 'Unbekannter Status.' };
  }

  const raw = str(input.company_id, 40);
  const companyId = raw && /^[0-9a-f-]{36}$/i.test(raw) ? raw : null;

  // Продано — значит кому-то. Без компании статус теряет смысл и на плане
  // выглядит занятым, а кем — неизвестно.
  if (status === 'vergeben' && !companyId) {
    return { ok: false, error: 'Für «vergeben» muss eine Firma gewählt sein.' };
  }
  // Свободна — значит ничья. Иначе площадка останется привязанной к компании,
  // и следующий заказ уедет не туда.
  if (status === 'frei' && companyId) {
    return { ok: false, error: 'Eine freie Fläche kann keiner Firma gehören.' };
  }

  return { ok: true, value: { status, company_id: companyId } };
}

/** Смена статуса заявки с витрины. */
export function validateAnfrageUpdate(input = {}) {
  const status = str(input.status);
  if (!ANFRAGE_STATUS.includes(status)) {
    return { ok: false, error: 'Unbekannter Status.' };
  }
  return { ok: true, value: { status, notiz_intern: str(input.notiz_intern, 2000) } };
}
