import { supabaseAdmin } from './supabase';

/**
 * Площадки компании.
 *
 * Каталог заполнен из прототипа (см. supabase/seed-stands.sql). Статус и
 * привязку к компании ведёт Messeleitung — приложение их только читает:
 * продажа площади происходит вне портала, по телефону и почте.
 */

/** Что показываем экспоненту про его площадку. */
const FIELDS = 'id, halle, lage, breite_m, tiefe_m, flaeche_m2, status';

/**
 * Площадки, закреплённые за компанией. Обычно одна, но их может быть
 * несколько: компания берёт вторую площадь или стенд в другом зале.
 */
export async function standsOfCompany(companyId) {
  if (!companyId) return [];
  const { data, error } = await supabaseAdmin
    .from('mz_stands')
    .select(FIELDS)
    .eq('company_id', companyId)
    .order('id');

  if (error) {
    console.error('standsOfCompany: не удалось прочитать площадки', error);
    return [];
  }
  return data || [];
}

/**
 * Человеческая подпись размера: «10 × 8 m · 80 m²».
 *
 * Отсутствие площади проверяем ДО Number(): `Number(null)` равен нулю и
 * проходит как конечное число, из-за чего площадка без площади показывала
 * бы «· 0 m²». Площадь приходит из базы строкой ('80.00') — PostgREST
 * отдаёт numeric так, — поэтому приведение к числу всё равно нужно.
 */
export function formatSize(stand) {
  if (!stand) return '';

  const raw = stand.flaeche_m2;
  const missing = raw === null || raw === undefined || raw === '';
  const flaeche = missing ? NaN : Number(raw);
  const area = Number.isFinite(flaeche) ? `${Math.round(flaeche)} m²` : '';

  return `${stand.breite_m} × ${stand.tiefe_m} m${area ? ` · ${area}` : ''}`;
}
