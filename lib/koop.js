import { supabaseAdmin } from './supabase';

/**
 * Совместный маркетинг: меры, подтверждения и баллы.
 *
 * Что известно и что нет. Баллы за каждую меру согласованы и лежат в каталоге.
 * А вот сколько процентов скидки дают 100 баллов и каков потолок на счёт —
 * бизнес не назвал, поэтому в интерфейсе там XX. Считать процент нам не из
 * чего, и подставить правдоподобный нельзя: экспонент прочитает его как
 * обещание скидки, а потом получит счёт.
 *
 * Баллы начисляются только по подтверждённым мерам. Заявленное намерение
 * ничего не стоит: скидку даёт выполненная работа, а не поставленная галочка.
 */

/** Столько баллов соответствует максимальной скидке. Из прототипа. */
export const MAX_PUNKTE = 100;

export const STATUS = ['eingereicht', 'bestaetigt', 'abgelehnt'];

const NACHWEIS_FIELDS =
  'id, massnahme_id, umgesetzt_am, link, datei_pfad, bemerkung, status, punkte, created_at';

function str(value, max = 300) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Проверка подтверждения.
 *
 * Ссылка или файл обязательны: замечание — это не доказательство, а по
 * пустому подтверждению Messeleitung нечего проверять и придётся писать
 * экспоненту вручную.
 */
export function validateNachweis(input = {}, { hatDatei = false } = {}) {
  const massnahmeId = str(input.massnahme_id, 40);
  if (!massnahmeId) return { ok: false, error: 'Massnahme fehlt.' };

  const link = str(input.link, 500);
  if (link && !/^https?:\/\/\S+$/i.test(link)) {
    return { ok: false, error: 'Link bitte vollständig angeben, mit https://' };
  }

  if (!link && !hatDatei) {
    return { ok: false, error: 'Bitte einen Beleg hochladen oder einen Link angeben.' };
  }

  const umgesetzt = str(input.umgesetzt_am, 10);
  if (umgesetzt && !/^\d{4}-\d{2}-\d{2}$/.test(umgesetzt)) {
    return { ok: false, error: 'Datum bitte als JJJJ-MM-TT angeben.' };
  }

  return {
    ok: true,
    value: {
      massnahme_id: massnahmeId,
      link,
      umgesetzt_am: umgesetzt || null,
      bemerkung: str(input.bemerkung, 1000),
    },
  };
}

/**
 * Можно ли подать ещё одно подтверждение по этой мере.
 *
 * Два правила, оба из прототипа:
 * — по одной мере одно живое подтверждение: второе не удваивает баллы,
 *   а создаёт Messeleitung двойную работу;
 * — в группе `einfach` засчитывается только одна мера: нельзя получить
 *   баллы и за полностраничный, и за половинный макет в одном каталоге.
 *
 * Отклонённое подтверждение не мешает: человек исправился и подаёт заново.
 *
 * @returns {{ok: true}|{ok: false, error: string}}
 */
export function darfEinreichen(massnahme, vorhandene = [], katalog = []) {
  if (!massnahme) return { ok: false, error: 'Unbekannte Massnahme.' };

  const lebendig = vorhandene.filter((n) => n.status !== 'abgelehnt');

  if (lebendig.some((n) => n.massnahme_id === massnahme.id)) {
    return { ok: false, error: 'Für diese Massnahme liegt bereits ein Nachweis vor.' };
  }

  if (massnahme.gruppe_modus === 'einfach') {
    const inGruppe = new Set(
      katalog.filter((m) => m.gruppe === massnahme.gruppe).map((m) => m.id)
    );
    if (lebendig.some((n) => inGruppe.has(n.massnahme_id))) {
      return {
        ok: false,
        error: `In der Gruppe «${massnahme.gruppe}» wird nur eine Massnahme angerechnet.`,
      };
    }
  }

  return { ok: true };
}

/**
 * Сводка по баллам.
 *
 * Подтверждённые баллы обрезаются по потолку: сто баллов — это максимум
 * скидки, и показать «120 из 100» значило бы обещать больше максимума.
 */
export function punkteSumme(nachweise = [], katalog = []) {
  const punkteVon = new Map(katalog.map((m) => [m.id, m.punkte]));

  const wert = (n) =>
    // Подтверждённое считаем по снимку: правка каталога не должна менять
    // уже начисленное.
    n.punkte ?? punkteVon.get(n.massnahme_id) ?? 0;

  const bestaetigt = nachweise.filter((n) => n.status === 'bestaetigt');
  const offen = nachweise.filter((n) => n.status === 'eingereicht');

  const summe = bestaetigt.reduce((s, n) => s + wert(n), 0);

  return {
    bestaetigt: Math.min(summe, MAX_PUNKTE),
    ueberschuss: Math.max(0, summe - MAX_PUNKTE),
    offen: offen.reduce((s, n) => s + wert(n), 0),
    anteil: Math.min(100, Math.round((summe / MAX_PUNKTE) * 100)),
  };
}

/** Каталог мер, сгруппированный для показа. */
export function gruppiereMassnahmen(katalog = []) {
  const gruppen = new Map();
  for (const m of katalog) {
    if (!gruppen.has(m.gruppe)) {
      gruppen.set(m.gruppe, { gruppe: m.gruppe, modus: m.gruppe_modus, massnahmen: [] });
    }
    gruppen.get(m.gruppe).massnahmen.push(m);
  }
  return [...gruppen.values()];
}

export async function ladeKatalog() {
  const { data, error } = await supabaseAdmin
    .from('mz_koop_massnahmen')
    .select('id, gruppe, gruppe_modus, titel, beschreibung, punkte')
    .eq('aktiv', true)
    .order('sortierung');

  if (error) {
    console.error('ladeKatalog: не удалось прочитать меры', error);
    return [];
  }
  return data || [];
}

export async function nachweiseFuerCompany(companyId) {
  if (!companyId) return [];

  const { data, error } = await supabaseAdmin
    .from('mz_koop_nachweise')
    .select(NACHWEIS_FIELDS)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('nachweiseFuerCompany: не удалось прочитать', error);
    return [];
  }
  return data || [];
}

/** Всё на проверку — старое сверху, чтобы не залёживалось. */
export async function alleNachweise() {
  const { data, error } = await supabaseAdmin
    .from('mz_koop_nachweise')
    .select(`${NACHWEIS_FIELDS}, mz_companies(name), mz_koop_massnahmen(titel, punkte, gruppe)`)
    .order('created_at', { ascending: true })
    .limit(300);

  if (error) {
    console.error('alleNachweise: не удалось прочитать', error);
    return [];
  }
  return data || [];
}
