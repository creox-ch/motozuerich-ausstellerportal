import { supabaseAdmin } from './supabase';

/**
 * Переписка экспонента с Messeleitung.
 *
 * Одна лента на компанию, без тем и веток: адресат с нашей стороны один,
 * а экспонентов десятки — ветки были бы формой без содержания.
 *
 * Отметки «прочитано» здесь нет намеренно. Она требует места, где её ставят,
 * и порождает вопрос «прочитано кем» — за компанию работают несколько человек.
 * Полезный ответ проще: неотвеченным считается разговор, где последнее слово
 * за экспонентом. Это видно из самих сообщений и не может разойтись с ними.
 */

/** Длина сообщения. Больше — это уже документ, для них есть свой раздел. */
export const MAX_LAENGE = 4000;

const FIELDS = 'id, company_id, von, autor_email, text, created_at';

/**
 * Проверка текста сообщения.
 *
 * Обрезать длинный текст молча нельзя: человек не узнает, что половина письма
 * не дошла, и будет ждать ответа на несказанное.
 *
 * @returns {{ok: true, value: {text: string}}|{ok: false, error: string}}
 */
export function validateNachricht(input = {}) {
  const text = typeof input.text === 'string' ? input.text.trim() : '';

  if (!text) return { ok: false, error: 'Nachricht ist leer.' };
  if (text.length > MAX_LAENGE) {
    return {
      ok: false,
      error: `Nachricht ist zu lang (maximal ${MAX_LAENGE} Zeichen).`,
    };
  }
  return { ok: true, value: { text } };
}

/** Лента одной компании, от старых к новым — как её читает человек. */
export async function nachrichtenFuerCompany(companyId) {
  if (!companyId) return [];

  const { data, error } = await supabaseAdmin
    .from('mz_nachrichten')
    .select(FIELDS)
    .eq('company_id', companyId)
    .order('created_at', { ascending: true })
    .limit(300);

  if (error) {
    console.error('nachrichtenFuerCompany: не удалось прочитать', error);
    return [];
  }
  return data || [];
}

/**
 * Разговоры для админки: по одному на компанию, неотвеченные сверху.
 *
 * Группировка в коде, а не запросом с group by: строк здесь сотни, а не
 * миллионы, зато правило «неотвеченный» остаётся читаемым и проверяемым
 * тестом, вместо того чтобы жить внутри SQL.
 */
export async function threadsFuerAdmin() {
  const { data, error } = await supabaseAdmin
    .from('mz_nachrichten')
    .select(`${FIELDS}, mz_companies(name)`)
    .order('created_at', { ascending: true })
    .limit(1000);

  if (error) {
    console.error('threadsFuerAdmin: не удалось прочитать', error);
    return [];
  }

  return gruppiereThreads(data || []);
}

/**
 * Чистая часть группировки — вынесена, чтобы её можно было проверить тестом
 * без базы.
 *
 * @param {Array<object>} alle все сообщения, от старых к новым
 */
export function gruppiereThreads(alle) {
  const nachFirma = new Map();

  for (const n of alle) {
    if (!n?.company_id) continue;
    if (!nachFirma.has(n.company_id)) {
      nachFirma.set(n.company_id, {
        companyId: n.company_id,
        firma: n.mz_companies?.name || null,
        nachrichten: [],
      });
    }
    nachFirma.get(n.company_id).nachrichten.push(n);
  }

  const threads = [...nachFirma.values()].map((t) => {
    const letzte = t.nachrichten[t.nachrichten.length - 1];
    return {
      ...t,
      letzte,
      // Последнее слово за экспонентом — значит мы ещё не ответили.
      offen: letzte?.von === 'aussteller',
    };
  });

  // Неотвеченные сверху, внутри — по свежести последнего сообщения.
  return threads.sort((a, b) => {
    if (a.offen !== b.offen) return a.offen ? -1 : 1;
    return String(b.letzte?.created_at || '').localeCompare(String(a.letzte?.created_at || ''));
  });
}

/** Активные адреса компании — кому уходит уведомление об ответе. */
export async function empfaengerDerCompany(companyId) {
  if (!companyId) return [];

  const { data, error } = await supabaseAdmin
    .from('mz_allowlist')
    .select('email')
    .eq('company_id', companyId)
    .eq('aktiv', true);

  if (error) {
    console.error('empfaengerDerCompany: не удалось прочитать список', error);
    return [];
  }
  return (data || []).map((z) => z.email).filter(Boolean);
}
