const { defineConfig } = require('@playwright/test');

/**
 * Конфигурация для тестов, которым нужна НАСТОЯЩАЯ база.
 *
 * Отличие от основной одно, но принципиальное: переменные окружения не
 * подменяются заглушками — приложение поднимается с боевыми значениями
 * из .env.local. Поэтому прогон делается руками и осознанно.
 *
 * Почему такие тесты вообще существуют — tests/live/README.md.
 */
module.exports = defineConfig({
  testDir: 'tests/live',
  timeout: 45_000,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
