import { supabaseAdmin } from './supabase';

/**
 * Цены на площади.
 *
 * Сумм пока нет: бизнес не решил ни модель (за квадратный метр или за место),
 * ни числа. Поэтому здесь всё построено вокруг честного «не определено»,
 * а не вокруг подставленных правдоподобных цифр.
 *
 * Почему не вымышленные суммы. Цена, показанная потенциальному экспоненту,
 * читается как предложение: увидел 4'500, получил счёт на 6'000 — разговор
 * неприятный. И такие числа доживают до прода именно потому, что выглядят
 * правдоподобно и глаз за них не цепляется. «XX» не переживёт запуск,
 * «4'500» — запросто.
 *
 * Цена живёт данными, а не разметкой: появление настоящих сумм должно быть
 * заполнением таблицы, а не задачей на разработку и деплой.
 */

/** От частного к общему: конкретная площадка → расположение → зал → все. */
const SCOPE_ORDER = ['stand', 'lage', 'halle', 'alle'];

/**
 * Цены в прайсе Messeleitung — НЕТТО, без НДС («Preis exkl. MwSt.»).
 *
 * Пометка обязательна рядом с каждой суммой: без неё экспонент читает цену
 * как итоговую, а счёт приходит на восемь процентов больше. Разговор потом
 * тяжёлый и справедливо неприятный.
 */
export const PREIS_NETTO_HINWEIS = 'exkl. MwSt.';

/**
 * Что входит в цену площадки. Из шапки прайса, колонки с галочками.
 *
 * Держится здесь, а не в базе, потому что различие ровно одно — ковролин,
 * и заводить ради него таблицу дороже, чем полезно. Как только залы начнут
 * отличаться всерьёз, это переедет в данные.
 *
 * Список важен не для красоты: 13'400 за восемьдесят метров читаются как
 * дорогая аренда пола, пока не видно, что ток, свет, уборка и WLAN уже внутри.
 */
const INKLUSIVE_BASIS = [
  'Strom T-13 inkl. Verbrauch',
  'Tägliche Reinigung der Standfläche und Abfallentsorgung',
  'Hochleistungs-WLAN',
  'Eintrag im Ausstellerverzeichnis mit Logo und Verlinkung',
];

const INKLUSIVE = {
  'Halle D': [...INKLUSIVE_BASIS, 'Lichtkonzept «Flächige Ausleuchtung»'],
  'Halle 550': [...INKLUSIVE_BASIS, 'Lichtkonzept «StageOne»'],
  StageOne: [...INKLUSIVE_BASIS, 'Lichtkonzept «StageOne»', 'Teppichboden'],
};

/**
 * Услуги, входящие в цену площадки этого зала.
 * Неизвестный зал — пустой список, а не догадка.
 */
export function leistungenInklusive(halle) {
  return INKLUSIVE[halle] || [];
}

/** Все правила прайса разом — их единицы, выбирать по одному нет смысла. */
export async function loadPriceRules() {
  const { data, error } = await supabaseAdmin
    .from('mz_preise')
    .select('gilt_fuer, schluessel, modell, betrag_rappen, waehrung');

  if (error) {
    console.error('loadPriceRules: не удалось прочитать прайс', error);
    return [];
  }
  return data || [];
}

/**
 * Правило, применимое к площадке. Побеждает самое частное из подходящих.
 *
 * @returns {object|null}
 */
export function matchRule(stand, rules = []) {
  if (!stand) return null;

  const candidates = {
    stand: stand.id,
    lage: stand.lage,
    halle: stand.halle,
    alle: null,
  };

  for (const scope of SCOPE_ORDER) {
    const key = candidates[scope];
    const rule = rules.find(
      (r) => r.gilt_fuer === scope && (scope === 'alle' || r.schluessel === key)
    );
    if (rule) return rule;
  }
  return null;
}

/**
 * Цена площадки.
 *
 * @returns {{known: boolean, rappen?: number, waehrung?: string, modell?: string}}
 */
export function priceFor(stand, rules = []) {
  const rule = matchRule(stand, rules);
  if (!rule || rule.betrag_rappen === null || rule.betrag_rappen === undefined) {
    return { known: false };
  }

  const betrag = Number(rule.betrag_rappen);
  if (!Number.isFinite(betrag)) return { known: false };

  const flaeche = Number(stand?.flaeche_m2);
  const total =
    rule.modell === 'pro_m2' && Number.isFinite(flaeche) ? betrag * flaeche : betrag;

  return {
    known: true,
    rappen: Math.round(total),
    waehrung: rule.waehrung || 'CHF',
    modell: rule.modell,
  };
}

/**
 * Подпись цены для интерфейса. Когда цены нет — возвращаем null, а показать
 * вместо неё пометку «ещё не определено» решает страница: это осознанное
 * состояние, а не ошибка, и выглядеть оно должно как в прототипе.
 */
export function formatPrice(price) {
  if (!price?.known) return null;

  const franken = price.rappen / 100;
  const gerundet = Math.round(franken * 100) / 100;
  // Швейцарский разделитель тысяч — апостроф, как в прототипе (22'117).
  const [ganz, dezimal] = gerundet.toFixed(2).split('.');
  const mitTrenner = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const betrag = dezimal === '00' ? mitTrenner : `${mitTrenner}.${dezimal}`;

  return `${price.waehrung} ${betrag}`;
}
