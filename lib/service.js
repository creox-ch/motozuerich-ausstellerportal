import { supabaseAdmin } from './supabase';

/**
 * Заказ техники и услуг к стенду.
 *
 * Цены в каталоге пока не заданы, и это не пробел: прототип прямо пишет
 * «Konditionen erhalten Sie mit der Auftragsbestätigung» — экспонент
 * собирает заказ, а условия приходят с подтверждением. Поэтому заказ
 * работает без единой цифры, а где цена нужна, стоит XX.
 */

/** Разделы, использующие одну и ту же механику заказа. */
export const BEREICHE = ['technik', 'marketing'];

/**
 * Каталог раздела с уже проставленными количествами компании.
 *
 * Техника и реклама в Event-Guide устроены одинаково: набор позиций,
 * черновик, отправка, условия с подтверждением. Поэтому механика одна,
 * а не две параллельные — иначе они разошлись бы на первой же правке.
 */
export async function loadServiceOrder(companyId, bereich = 'technik') {
  const [{ data: katalog }, { data: positionen }, { data: auftrag }] = await Promise.all([
    supabaseAdmin
      .from('mz_service_katalog')
      .select('id, bezeichnung, beschreibung, einheit, preis_rappen')
      .eq('aktiv', true)
      .eq('bereich', bereich)
      .order('sortierung'),
    supabaseAdmin
      .from('mz_service_positionen')
      .select('position_id, menge')
      .eq('company_id', companyId),
    supabaseAdmin
      .from('mz_service_auftraege')
      .select('bemerkung, eingereicht_am')
      .eq('company_id', companyId)
      .eq('bereich', bereich)
      .maybeSingle(),
  ]);

  const mengen = new Map((positionen || []).map((p) => [p.position_id, p.menge]));

  return {
    katalog: (katalog || []).map((k) => ({ ...k, menge: mengen.get(k.id) ?? 0 })),
    bemerkung: auftrag?.bemerkung || '',
    eingereichtAm: auftrag?.eingereicht_am || null,
  };
}

/**
 * Приводит присланные количества к тому, что можно записать.
 *
 * Позиции сверяются с каталогом: прислать выдуманный идентификатор нельзя.
 * Отрицательные и нечисловые значения превращаются в ноль, а не в ошибку —
 * это ввод из поля со стрелочками, ругаться тут не за что.
 *
 * @returns {{ok: boolean, error?: string, positionen?: Array}}
 */
export function normalizeOrder(input, katalogIds) {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'ungültige Anfrage' };
  }

  const erlaubt = new Set(katalogIds);
  const positionen = [];

  for (const [id, wert] of Object.entries(input)) {
    if (!erlaubt.has(id)) continue; // чужие ключи молча отбрасываем
    const zahl = Number(wert);
    const menge = Number.isFinite(zahl) && zahl > 0 ? Math.floor(zahl) : 0;
    if (menge > MAX_MENGE) {
      return { ok: false, error: `Menge zu hoch (maximal ${MAX_MENGE}).` };
    }
    positionen.push({ position_id: id, menge });
  }

  if (positionen.length === 0) {
    return { ok: false, error: 'Keine bekannten Positionen übermittelt.' };
  }

  return { ok: true, positionen };
}

/** Верхняя граница, чтобы опечатка не превратилась в заказ на тысячу стульев. */
export const MAX_MENGE = 999;

/** Сколько позиций реально заказано — для сводки и бейджа. */
export function countPositions(katalog = []) {
  return katalog.filter((k) => k.menge > 0).length;
}
