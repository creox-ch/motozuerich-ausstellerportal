import { test, expect } from '@playwright/test';

/** Integration: совместные активности закрыты без сессии. */

const ID = '11111111-2222-3333-4444-555555555555';

test('подтверждение без сессии → 401', async ({ request }) => {
  const res = await request.post('/api/koop', {
    multipart: { massnahme_id: 'instagram', link: 'https://example.ch' },
  });
  expect(res.status()).toBe(401);
});

test('проверка подтверждения без сессии → 401', async ({ request }) => {
  const res = await request.patch('/api/admin/koop', { data: { id: ID, status: 'bestaetigt' } });
  expect(res.status()).toBe(401);
});

test('проверка прав стоит раньше разбора тела', async ({ request }) => {
  const res = await request.patch('/api/admin/koop', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(401);
});

test('страницы активностей без сессии не открываются', async ({ request }) => {
  for (const pfad of ['/portal/aktionen', '/admin/koop']) {
    const res = await request.get(pfad, { maxRedirects: 0 });
    expect([307, 302, 303], pfad).toContain(res.status());
  }
});
