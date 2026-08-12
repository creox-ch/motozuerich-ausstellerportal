import { supabaseAdmin } from './supabase';

/**
 * Документы и счета: файлы, которые идут ОТ Messeleitung экспоненту.
 *
 * Почему раздел не архивный. Доступ в портал выдаётся после оплаты, поэтому
 * счёт за площадь попадает сюда уже закрытым. Но внутри кабинета экспонент
 * заказывает технику, рекламу, парковку — за них выставляются дополнительные
 * счета, и вот они живут здесь по-настоящему.
 *
 * Правила доступа сосредоточены в этом модуле: страница и роут спрашивают
 * «что можно этой компании», а не собирают запрос сами. Разложенная по местам
 * проверка — способ однажды её забыть в одном месте из трёх.
 */

export const ART = ['dokument', 'rechnung'];

const FIELDS =
  'id, company_id, art, titel, dateiname, groesse_bytes, betrag_rappen, faellig_am, bezahlt_am, created_at';

function str(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Сумма из формы в раппены.
 *
 * В раппенах, как на всей платформе: 100 = 1.00 CHF. Целые числа — потому что
 * `19.99 * 100` в двоичной арифметике даёт 1998.9999999999998, и усечение
 * превратило бы это в 19.98. Отсюда Math.round, а не Math.trunc.
 *
 * Апострофы разделителя тысяч и запятую вместо точки принимаем: человек
 * набирает сумму так, как привык её видеть в счёте, а не так, как удобно коду.
 *
 * @returns {{ok: true, value: number|null}|{ok: false, error: string}}
 */
export function parseBetragRappen(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { ok: true, value: null };
  }

  const text = String(raw)
    .trim()
    .replace(/[’'\s]/g, '')
    .replace(',', '.');

  // Минус не принимаем сознательно: возврат и Gutschrift — отдельный документ
  // со своим смыслом, а не счёт с отрицательной суммой.
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    return { ok: false, error: 'Betrag bitte als Zahl angeben, z. B. 1250.00.' };
  }

  const rappen = Math.round(Number(text) * 100);
  if (!Number.isSafeInteger(rappen)) {
    return { ok: false, error: 'Betrag ist zu gross.' };
  }
  return { ok: true, value: rappen };
}

/** Швейцарская запись суммы: «CHF 1’250.00». Ничего нет — возвращаем null. */
export function formatBetrag(rappen) {
  if (rappen === null || rappen === undefined || rappen === '') return null;
  const zahl = Number(rappen);
  if (!Number.isFinite(zahl)) return null;

  const [ganz, teil] = (zahl / 100).toFixed(2).split('.');
  const mitTrenner = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return `CHF ${mitTrenner}.${teil}`;
}

/**
 * Проверка того, что Messeleitung заводит вместе с файлом.
 *
 * Ограничения продублированы в базе (см. supabase/schema.sql). Здесь они
 * нужны ради внятного сообщения человеку, там — чтобы данные не испортил
 * запрос мимо формы.
 */
export function validateDokument(input = {}) {
  const titel = str(input.titel, 120);
  if (!titel) return { ok: false, error: 'Titel ist erforderlich.' };

  const art = str(input.art) || 'dokument';
  if (!ART.includes(art)) return { ok: false, error: 'Unbekannte Art.' };

  const rawCompany = str(input.company_id, 40);
  const companyId = rawCompany && /^[0-9a-f-]{36}$/i.test(rawCompany) ? rawCompany : null;
  if (rawCompany && !companyId) {
    return { ok: false, error: 'Firma ist nicht ausgewählt.' };
  }

  // Счёт без компании раздался бы каждому, кто откроет раздел.
  if (art === 'rechnung' && !companyId) {
    return { ok: false, error: 'Eine Rechnung braucht eine Firma.' };
  }

  const betrag = parseBetragRappen(input.betrag);
  if (!betrag.ok) return { ok: false, error: betrag.error };

  const faellig = str(input.faellig_am, 10);
  if (faellig && !/^\d{4}-\d{2}-\d{2}$/.test(faellig)) {
    return { ok: false, error: 'Fälligkeitsdatum bitte als JJJJ-MM-TT angeben.' };
  }

  // Сумма и срок у обычного документа означают, что выбрали не тот тип.
  // Молча их отбросить — значит потерять введённое человеком без объяснения.
  if (art !== 'rechnung' && (betrag.value !== null || faellig)) {
    return { ok: false, error: 'Betrag und Fälligkeit gibt es nur bei Rechnungen.' };
  }

  return {
    ok: true,
    value: {
      titel,
      art,
      company_id: companyId,
      betrag_rappen: art === 'rechnung' ? betrag.value : null,
      faellig_am: art === 'rechnung' && faellig ? faellig : null,
    },
  };
}

/**
 * Что видит компания: свои документы и счета плюс общие для всех.
 *
 * Общие узнаются по пустому company_id. Отдельного флага «для всех» нет
 * намеренно: две колонки об одном и том же однажды разойдутся, и документ
 * окажется одновременно общим и чужим.
 */
export async function dokumenteFuerCompany(companyId) {
  if (!companyId) return { dokumente: [], rechnungen: [] };

  // Фильтр .or() собирается строкой, поэтому идентификатор проверяем на формат
  // прежде чем подставлять. Сюда он приходит из сессии, а не из запроса, — но
  // «пришёл из надёжного места» перестаёт быть правдой ровно в тот день, когда
  // функцию позовут откуда-то ещё.
  if (!/^[0-9a-f-]{36}$/i.test(String(companyId))) {
    console.error('dokumenteFuerCompany: подозрительный идентификатор компании');
    return { dokumente: [], rechnungen: [] };
  }

  const { data, error } = await supabaseAdmin
    .from('mz_dokumente')
    .select(FIELDS)
    .or(`company_id.eq.${companyId},company_id.is.null`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('dokumenteFuerCompany: не удалось прочитать', error);
    return { dokumente: [], rechnungen: [] };
  }

  const alle = data || [];
  return {
    dokumente: alle.filter((d) => d.art === 'dokument'),
    rechnungen: alle.filter((d) => d.art === 'rechnung'),
  };
}

/**
 * Один документ, если он положен этой компании. Иначе null.
 *
 * Единственная точка, решающая «отдавать ли файл». Проверка идёт по строке
 * из базы, а не по тому, что прислал браузер: идентификатор в запросе можно
 * подобрать, а вот company_id в строке подменить нельзя.
 */
export async function dokumentFuerCompany(id, companyId) {
  if (!id || !companyId) return null;

  const { data, error } = await supabaseAdmin
    .from('mz_dokumente')
    .select(`${FIELDS}, pfad`)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  if (data.company_id !== null && data.company_id !== companyId) return null;
  return data;
}

/** Все документы для админки — с названием компании, чтобы список читался. */
export async function alleDokumente() {
  const { data, error } = await supabaseAdmin
    .from('mz_dokumente')
    .select(`${FIELDS}, mz_companies(name)`)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('alleDokumente: не удалось прочитать', error);
    return [];
  }
  return data || [];
}
