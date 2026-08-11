/**
 * Проверка конфигурации окружения.
 *
 * Чистая функция без обращения к process.env — чтобы её можно было гонять
 * юнит-тестами с любым набором переменных, а не только с теми, что стоят
 * на машине. Роут /api/health вызывает её, передавая настоящий process.env.
 *
 * Значения переменных наружу не отдаём НИКОГДА — только имена отсутствующих.
 * Иначе health-эндпоинт превращается в утечку ключей.
 */

/** Переменные, без которых портал не работает вообще. */
export const REQUIRED_VARS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

/** Переменные, без которых работает, но с урезанными возможностями. */
export const OPTIONAL_VARS = [
  'RESEND_API_KEY',
  'PORTAL_FROM_EMAIL',
  'PORTAL_REPLY_TO',
  'PUBLIC_BASE_URL',
];

/** Пустая строка и строка из пробелов — это «не задано», а не значение. */
function isSet(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * @param {Record<string, string|undefined>} env
 * @returns {{ok: boolean, missingRequired: string[], missingOptional: string[]}}
 */
export function describeEnv(env = {}) {
  const missingRequired = REQUIRED_VARS.filter((name) => !isSet(env[name]));
  const missingOptional = OPTIONAL_VARS.filter((name) => !isSet(env[name]));
  return {
    ok: missingRequired.length === 0,
    missingRequired,
    missingOptional,
  };
}
