const { defineConfig } = require('@playwright/test');

/**
 * Слои тестов в tests/ (схема унаследована от бэкенда платформы slswiss-tickets):
 * - unit/         — чистые функции из lib/, браузер не нужен.
 * - e2e/          — страницы через next dev; наши API мокаются page.route,
 *                   поэтому Supabase и Resend для тестов НЕ нужны.
 * - integration/  — реальные API-роуты через request-фикстуру, без мока.
 *                   Проверяем ветки ДО обращения к базе (конфигурация, права,
 *                   валидация) — заглушек env ниже для этого достаточно,
 *                   потому что ленивый supabaseAdmin не инстанцируется, пока
 *                   тест не дойдёт до запроса, а эти ветки туда не доходят.
 * - pgtap/        — инварианты RLS в SQL, запускаются вручную (см. tests/pgtap).
 */
module.exports = defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Заглушки, чтобы приложение считало себя сконфигурированным и тесты
    // доходили до проверяемых веток. К настоящему Supabase не ходим.
    env: {
      ...process.env,
      SUPABASE_URL: process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
    },
  },
});
