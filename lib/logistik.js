import { supabaseAdmin } from './supabase';

/**
 * Подвоз, вывоз и парковка.
 *
 * Это заявка, а не бронь. Прототип бронирует часовые окна с квотами, но квоты
 * зависят от ворот и рамп, и площадка их ещё не назвала. Бронирование против
 * выдуманной квоты хуже, чем его отсутствие: два экспонента приедут к одним
 * воротам в один час, а разбирать это будет человек на площадке в шесть утра.
 *
 * Поэтому здесь собирается всё, что мы и так должны знать — когда удобно,
 * на чём приедут, кому звонить, — а окно назначает Messeleitung.
 */

export const TORE = ['Tor Halle D', 'Tor Halle 550', 'Tor StageOne'];

export const FAHRZEUGE = [
  'Personenwagen oder Bus',
  'Transporter bis 3.5 t',
  'Lastwagen bis 7.5 t',
  'Lastwagen über 7.5 t oder Sattelzug',
  'Anhänger oder Motorradtransporter',
];

/** Дни монтажа и демонтажа известны, квоты внутри дня — нет. */
export const ANLIEFERUNG_TAGE = ['Mittwoch 17.02.2027', 'Donnerstag 18.02.2027'];
export const ABTRANSPORT_TAGE = ['Sonntag 21.02.2027, nach Messeschluss', 'Montag 22.02.2027'];

/** Больше двух десятков карт на стенд — это уже опечатка, а не потребность. */
export const MAX_PARKKARTEN = 99;

function str(value, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function auswahl(value, erlaubt) {
  const gewaehlt = str(value, 80);
  return erlaubt.includes(gewaehlt) ? gewaehlt : '';
}

/**
 * Проверка заявки.
 *
 * Пустая заявка отклоняется: сохранить строку, в которой ничего нет, значит
 * показать экспоненту «отправлено» и не дать Messeleitung ни одного факта.
 *
 * @returns {{ok: true, value: object}|{ok: false, error: string}}
 */
export function validateLogistik(input = {}) {
  const roh = input.parkkarten;

  // Поля может не быть вовсе — заявку отправляют и без парковки. Проверять
  // число надо только там, где его вводили: иначе Number(undefined) даёт NaN,
  // и форма без парковки отвергается с сообщением про парковку. Ровно это
  // и поймал тест.
  const fehlt = roh === '' || roh === null || roh === undefined;
  const zahl = Number(roh);
  const parkkarten = fehlt ? 0 : Math.floor(zahl);

  if (!fehlt && (!Number.isFinite(zahl) || parkkarten < 0)) {
    return { ok: false, error: 'Anzahl Parkkarten bitte als Zahl angeben.' };
  }
  if (parkkarten > MAX_PARKKARTEN) {
    return { ok: false, error: `Höchstens ${MAX_PARKKARTEN} Parkkarten.` };
  }

  const value = {
    an_wunsch: auswahl(input.an_wunsch, ANLIEFERUNG_TAGE),
    an_tor: auswahl(input.an_tor, TORE),
    an_fahrzeug: auswahl(input.an_fahrzeug, FAHRZEUGE),
    an_kennzeichen: str(input.an_kennzeichen, 20),
    an_telefon: str(input.an_telefon, 40),

    ab_wunsch: auswahl(input.ab_wunsch, ABTRANSPORT_TAGE),
    ab_tor: auswahl(input.ab_tor, TORE),
    ab_fahrzeug: auswahl(input.ab_fahrzeug, FAHRZEUGE),

    parkkarten,
    park_notiz: str(input.park_notiz, 300),
  };

  const leer =
    parkkarten === 0 &&
    Object.entries(value)
      .filter(([k]) => k !== 'parkkarten')
      .every(([, v]) => !v);

  if (leer) return { ok: false, error: 'Bitte mindestens eine Angabe machen.' };

  return { ok: true, value };
}

/** Заявка компании. Строки может не быть — это нормально, ещё не заполняли. */
export async function logistikFuerCompany(companyId) {
  if (!companyId) return null;

  const { data, error } = await supabaseAdmin
    .from('mz_logistik')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) {
    console.error('logistikFuerCompany: не удалось прочитать', error);
    return null;
  }
  return data;
}

/** Все заявки для Messeleitung. */
export async function alleLogistik() {
  const { data, error } = await supabaseAdmin
    .from('mz_logistik')
    .select('*, mz_companies(name)')
    .not('eingereicht_am', 'is', null)
    .order('eingereicht_am', { ascending: true });

  if (error) {
    console.error('alleLogistik: не удалось прочитать', error);
    return [];
  }
  return data || [];
}
