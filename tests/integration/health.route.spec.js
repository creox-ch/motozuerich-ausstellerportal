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
});

test('несуществующий роут → 404', async ({ request }) => {
  const res = await request.get('/api/gibt-es-nicht');
  expect(res.status()).toBe(404);
});
