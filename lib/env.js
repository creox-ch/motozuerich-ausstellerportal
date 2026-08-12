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

/**
 * Переменные, которые ПЕРЕНАПРАВЛЯЮТ почту.
 *
 * У них аномалия — наличие, а не отсутствие, поэтому в missingOptional им
 * не место: там они висели бы вечным «чего-то не хватает».
 *
 * Зачем показывать их отдельно. Забытый в Production `PORTAL_MAIL_OVERRIDE`
 * молча уводит письма всех экспонентов в тестовый ящик — жалоб не будет,
 * потому что жаловаться будет некому: люди просто не получат код входа.
 * `PORTAL_NOTIFY_EMAIL` тише, но так же неприятен: заявки с витрины перестают
 * доходить до Ива, а витрина продолжает отвечать «спасибо».
 *
 * Снаружи это не проверить никак иначе — почта или дошла, или нет, и узнаём
 * мы об этом последними.
 */
export const UMLEITUNGS_VARS = ['PORTAL_MAIL_OVERRIDE', 'PORTAL_NOTIFY_EMAIL'];

/** Пустая строка и строка из пробелов — это «не задано», а не значение. */
function isSet(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * @param {Record<string, string|undefined>} env
 * @returns {{ok: boolean, missingRequired: string[], missingOptional: string[],
 *            aktiveUmleitungen: string[]}}
 */
export function describeEnv(env = {}) {
  const missingRequired = REQUIRED_VARS.filter((name) => !isSet(env[name]));
  const missingOptional = OPTIONAL_VARS.filter((name) => !isSet(env[name]));
  // Имена, не значения: адрес получателя — тоже чужие данные.
  const aktiveUmleitungen = UMLEITUNGS_VARS.filter((name) => isSet(env[name]));

  return {
    ok: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    aktiveUmleitungen,
  };
}
