import { test, expect } from '@playwright/test';

/**
 * Integration: настоящий обработчик GET /api/health через request-фикстуру,
 * без мока. До базы он не доходит, поэтому заглушек SUPABASE_* из
 * playwright.config.js достаточно.
 *
 * Смысл теста не в «эндпоинт отвечает», а в том, что служебная ручка не
 * превращается в способ вычитать ключи с продакшена.
 */

test('health отвечает 200 и подтверждает конфигурацию', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body).toMatchObject({ ok: true, service: 'ausstellerportal' });
  expect(body.missingRequired).toEqual([]);
});

test('health не отдаёт значения переменных окружения', async ({ request }) => {
  const res = await request.get('/api/health');
  const text = await res.text();

  // Заглушки из playwright.config.js — если они всплыли в ответе,
  // значит на проде всплывёт настоящий service_role ключ.
  expect(text).not.toContain('test-service-role-key');
  expect(text).not.toContain('127.0.0.1:54321');
  expect(text).not.toContain('tests@example.invalid');
});

test('health показывает включённое переопределение почты', async ({ request }) => {
  // В прогоне тестов PORTAL_MAIL_OVERRIDE задан заглушкой — значит ручка
  // обязана его показать. Ради этого она и нужна: снаружи узнать, куда
  // на самом деле уходит почта прода, больше нечем.
  const res = await request.get('/api/health');
  const body = await res.json();

  expect(body.aktiveUmleitungen).toContain('PORTAL_MAIL_OVERRIDE');
});

test('несуществующий роут → 404', async ({ request }) => {
  const res = await request.get('/api/gibt-es-nicht');
  expect(res.status()).toBe(404);
});
