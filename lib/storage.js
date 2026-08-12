import { supabaseAdmin } from './supabase';

/**
 * Файлы портала.
 *
 * Бакет приватный, политик доступа нет — как и у таблиц, читает и пишет
 * только сервер ключом service_role. Наружу файл попадает исключительно
 * подписанной ссылкой на короткий срок, которую выдаёт роут после проверки
 * прав. Публичный URL логотипа был бы перечислимым списком экспонентов:
 * зная схему адресов, посторонний узнаёт состав участников до анонса.
 */

export const BUCKET = 'ausstellerportal';

/** Сколько живёт подписанная ссылка. Хватает, чтобы открыть картинку. */
export const SIGNED_URL_TTL_S = 600;

/**
 * Правила по слотам. Лимиты разные, потому что назначение разное:
 * логотипу двух мегабайт с запасом, печатным макетам их не хватит.
 *
 * SVG для логотипа сознательно НЕ разрешён: внутри SVG может лежать скрипт,
 * а файл потом попадает на сайт и в приложение. Растровый логотип для
 * каталога достаточен, а для печати макет всё равно приходит отдельно.
 */
export const SLOTS = {
  logo: {
    maxBytes: 2 * 1024 * 1024,
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    label: 'Logo',
  },
  /**
   * Документы и счета от Messeleitung. Кладёт их только персонал, поэтому
   * лимит выше: план монтажа и Merkblatt бывают тяжёлыми.
   *
   * PDF и только он. Word и Excel открываются с макросами, а документ выставки
   * рассылается десяткам людей — это не то место, где стоит экономить на
   * формате. Счёт и регламент в PDF выглядят одинаково у всех.
   */
  dokument: {
    maxBytes: 20 * 1024 * 1024,
    mimeTypes: ['application/pdf'],
    label: 'Dokument',
  },
  /**
   * Подтверждение выполненной меры: скриншот поста, фото витрины, скан
   * страницы каталога. Форматы шире, чем у документа, — экспонент снимает
   * телефоном, а не вёрстку сдаёт.
   */
  nachweis: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
    label: 'Nachweis',
  },
};

/**
 * Имя файла из браузера — недоверенные данные: там бывают слэши, «..»,
 * юникод и произвольная длина. Оставляем только безопасное, а уникальность
 * даёт префикс, а не исходное имя.
 */
export function sanitizeFilename(name) {
  const raw = String(name || 'datei').split(/[\\/]/).pop() || 'datei';
  const dot = raw.lastIndexOf('.');
  const base = (dot > 0 ? raw.slice(0, dot) : raw).replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 60);
  const ext = (dot > 0 ? raw.slice(dot + 1) : '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toLowerCase();
  const safeBase = base.replace(/^[-.]+/, '') || 'datei';
  return ext ? `${safeBase}.${ext}` : safeBase;
}

/**
 * Путь начинается с идентификатора компании. Тогда чужой файл нельзя отдать
 * по ошибке: несовпадение префикса видно сразу и в коде, и в дашборде.
 */
export function storagePath(companyId, slot, filename, unique) {
  return `${companyId}/${slot}/${unique}-${sanitizeFilename(filename)}`;
}

/**
 * Проверка файла на сервере. Атрибут accept в разметке — подсказка человеку,
 * а не защита: запрос можно отправить мимо формы.
 *
 * @returns {{ok: true}|{ok: false, error: string}}
 */
export function validateUpload({ size, type }, slot) {
  const rules = SLOTS[slot];
  if (!rules) return { ok: false, error: 'Unbekannter Upload-Typ.' };

  if (!size) return { ok: false, error: 'Die Datei ist leer.' };

  if (size > rules.maxBytes) {
    const mb = Math.round((rules.maxBytes / 1024 / 1024) * 10) / 10;
    return { ok: false, error: `Die Datei ist zu gross (maximal ${mb} MB).` };
  }

  if (!rules.mimeTypes.includes(String(type).toLowerCase())) {
    const list = rules.mimeTypes.map((m) => m.split('/')[1].toUpperCase()).join(', ');
    return { ok: false, error: `Nur ${list} sind möglich.` };
  }

  return { ok: true };
}

/** Подписанная ссылка на файл. null, если пути нет или файл исчез. */
export async function signedUrl(path) {
  if (!path) return null;
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_S);
  if (error) {
    console.error('signedUrl: не удалось подписать', path, error);
    return null;
  }
  return data?.signedUrl || null;
}

/**
 * Удаление старого файла при замене. Ошибку не поднимаем: не удалённый
 * файл — это мусор в хранилище, а упавшая на этом загрузка — потерянная
 * работа человека. Мусор дешевле.
 */
export async function removeQuietly(path) {
  if (!path) return;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) console.error('removeQuietly: не удалось удалить', path, error);
}
