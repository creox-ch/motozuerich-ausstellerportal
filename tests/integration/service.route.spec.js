import { test, expect } from '@playwright/test';

/**
 * Integration: заказ техники без сессии.
 *
 * Проверка прав стоит первой — раньше разбора тела и обращения к каталогу.
 */

test('PUT без сессии → 401', async ({ request }) => {
  const res = await request.put('/api/service', { data: { mengen: { bartisch: 1 } } });
  expect(res.status()).toBe(401);
});

test('PUT с кривым телом без сессии → 401, а не 400', async ({ request }) => {
  const res = await request.put('/api/service', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(401);
});

test('страницы заказа без входа не открываются', async ({ request }) => {
  for (const pfad of ['/portal/technik', '/portal/marketing']) {
    const res = await request.get(pfad, { maxRedirects: 0 });
    expect([307, 302, 303], pfad).toContain(res.status());
  }
});
