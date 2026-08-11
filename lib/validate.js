/**
 * Проверка пользовательского ввода на входе.
 *
 * Чистые функции: принимают значение, возвращают результат, ничего не читают
 * из окружения и никуда не ходят. Поэтому проверяются юнит-тестами целиком,
 * включая случаи, которые руками не навводишь.
 */

/**
 * Приводит адрес к каноническому виду: обрезает пробелы, опускает регистр.
 * Тот же вид, к которому триггер приводит строки в mz_allowlist — иначе
 * «Firma@Example.CH» из формы не нашёл бы «firma@example.ch» в базе.
 */
export function normalizeEmail(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().toLowerCase();
}

/**
 * Проверка адреса. Сознательно нестрогая: полная проверка по RFC невозможна
 * и не нужна — настоящий фильтр в том, дойдёт ли письмо. Здесь отсекаем
 * очевидный мусор, чтобы не дёргать почтовый сервис зря.
 */
export function isEmail(raw) {
  const email = normalizeEmail(raw);
  if (email.length < 6 || email.length > 254) return false;
  if (/\s/.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (!domain.includes('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (domain.includes('..')) return false;
  return true;
}

/**
 * Код входа.
 *
 * Длина НЕ зашита. Изначально здесь стояло «ровно шесть цифр» — по умолчанию
 * так и есть в документации, но живая проверка показала, что наш проект
 * Supabase выдаёт восьмизначный код, и вход отбивался ещё до обращения
 * к Supabase, с сообщением про шесть цифр.
 *
 * Длина кода — настройка на стороне Supabase, её могут изменить в дашборде,
 * поэтому здесь только грубая отсечка мусора: цифры и разумный диапазон.
 * Настоящую проверку делает verifyOtp, и она единственная авторитетна.
 */
export function isLoginCode(raw) {
  return typeof raw === 'string' && /^\d{4,12}$/.test(raw.trim());
}

/** Код может приехать с пробелами из буфера обмена — чистим перед сверкой. */
export function normalizeLoginCode(raw) {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, '');
}
