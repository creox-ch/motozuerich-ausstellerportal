import { isEmail, normalizeEmail } from './validate';

/**
 * Правила профиля компании.
 *
 * Один модуль на всех: форма показывает ошибки по этим же правилам, роут
 * проверяет ими же перед записью. Проверка только на клиенте не защищает
 * ничего — запрос можно отправить мимо формы.
 *
 * Всё, что не обязательно, действительно необязательно: экспонент заполняет
 * профиль постепенно и должен иметь возможность сохранить его наполовину.
 * Единственное обязательное поле — название компании: без него запись
 * бессмысленна, она попадёт в каталог пустой строкой.
 */

/** Категории каталога. Взяты из прототипа — их же видит посетитель на сайте. */
export const KATEGORIEN = [
  'Motorräder & Importeure',
  'Zubehör & Ausrüstung',
  'Bekleidung',
  'Reisen & Destinationen',
  'Werkstatt & Technik',
  'Clubs & Verbände',
];

export const MAX_BESCHREIBUNG = 300;
const MAX_BRANDS = 30;
const MAX_BRAND_LEN = 60;

/** Поля, которые экспонент может менять сам. Всё остальное — не его. */
export const EDITABLE_FIELDS = [
  'name',
  'uid_nummer',
  'strasse',
  'ort',
  'kontakt_name',
  'kontakt_tel',
  'rechnungs_email',
  'kategorie',
  'website',
  'brands',
  'beschreibung',
  'public_email',
  'instagram',
];

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** «BMW, Ducati , , Honda» → ['BMW','Ducati','Honda'] */
export function parseBrands(raw) {
  const source = Array.isArray(raw) ? raw : String(raw ?? '').split(',');
  const seen = new Set();
  const out = [];
  for (const item of source) {
    const brand = str(item);
    if (!brand) continue;
    const key = brand.toLowerCase();
    if (seen.has(key)) continue; // дубли в каталоге выглядят неряшливо
    seen.add(key);
    out.push(brand);
  }
  return out;
}

export function formatBrands(brands) {
  return Array.isArray(brands) ? brands.join(', ') : '';
}

/**
 * Приводит ввод к тому, что можно записать, и собирает ошибки по полям.
 *
 * Возвращает ТОЛЬКО те поля, которые пришли в запросе. Это важно: если
 * возвращать все поля с пустыми значениями по умолчанию, то запрос с одним
 * полем сотрёт всё остальное. Живая проверка это и показала — сохранение
 * с двумя полями обнулило категорию, марки, сайт и адреса.
 *
 * Форма всегда шлёт всё сразу, поэтому в интерфейсе такое не проявляется —
 * и тем опаснее: заметить нечем, пока не появится второй способ сохранить.
 *
 * @returns {{ok: boolean, errors: Record<string,string>, value: Record<string,any>}}
 */
export function validateProfile(input = {}) {
  const errors = {};
  const value = {};
  const has = (field) => Object.prototype.hasOwnProperty.call(input, field);

  if (has('name')) {
    const name = str(input.name);
    if (!name) {
      errors.name = 'Firmenname ist erforderlich.';
    } else if (name.length > 120) {
      errors.name = 'Firmenname ist zu lang (maximal 120 Zeichen).';
    }
    value.name = name;
  }

  if (has('beschreibung')) {
    const beschreibung = str(input.beschreibung);
    if (beschreibung.length > MAX_BESCHREIBUNG) {
      errors.beschreibung = `Beschreibung ist zu lang (maximal ${MAX_BESCHREIBUNG} Zeichen).`;
    }
    value.beschreibung = beschreibung;
  }

  if (has('kategorie')) {
    const kategorie = str(input.kategorie);
    if (kategorie && !KATEGORIEN.includes(kategorie)) {
      errors.kategorie = 'Unbekannte Kategorie.';
    }
    value.kategorie = kategorie;
  }

  for (const [field, label] of [
    ['rechnungs_email', 'Rechnungs-E-Mail'],
    ['public_email', 'E-Mail für den Verzeichniseintrag'],
  ]) {
    if (!has(field)) continue;
    const raw = str(input[field]);
    if (raw && !isEmail(raw)) {
      errors[field] = `${label}: keine gültige Adresse.`;
    }
    value[field] = raw ? normalizeEmail(raw) : '';
  }

  if (has('website')) {
    const website = str(input.website);
    if (website && !/^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(website)) {
      errors.website = 'Website: bitte mit https:// angeben.';
    }
    value.website = website;
  }

  if (has('instagram')) {
    // Принимаем и @имя, и ссылку — люди присылают и так, и так.
    const instagram = str(input.instagram).replace(/^@/, '');
    if (instagram && !/^[\w.\-/:]+$/.test(instagram)) {
      errors.instagram = 'Instagram: nur Benutzername oder Link.';
    }
    value.instagram = instagram;
  }

  if (has('brands')) {
    const brands = parseBrands(input.brands);
    if (brands.length > MAX_BRANDS) {
      errors.brands = `Zu viele Marken (maximal ${MAX_BRANDS}).`;
    } else if (brands.some((b) => b.length > MAX_BRAND_LEN)) {
      errors.brands = 'Ein Markenname ist zu lang.';
    }
    value.brands = brands.slice(0, MAX_BRANDS);
  }

  for (const field of ['uid_nummer', 'strasse', 'ort', 'kontakt_name', 'kontakt_tel']) {
    if (!has(field)) continue;
    const raw = str(input[field]);
    if (raw.length > 200) {
      errors[field] = 'Wert ist zu lang.';
    }
    value[field] = raw;
  }

  if (Object.keys(value).length === 0 && Object.keys(errors).length === 0) {
    errors._ = 'Keine Daten zum Speichern.';
  }

  return { ok: Object.keys(errors).length === 0, errors, value };
}
