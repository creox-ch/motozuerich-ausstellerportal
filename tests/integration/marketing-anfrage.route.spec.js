import { test, expect } from '@playwright/test';

/** Integration: заявки по маркетингу закрыты без сессии. */

const ID = '11111111-2222-3333-4444-555555555555';

test('заявка без сессии → 401', async ({ request }) => {
  const res = await request.post('/api/marketing-anfrage', {
    multipart: { art: 'led_wall' },
  });
  expect(res.status()).toBe(401);
});

test('смена статуса без сессии → 401', async ({ request }) => {
  const res = await request.patch('/api/admin/marketing-anfrage', {
    data: { id: ID, status: 'erledigt' },
  });
  expect(res.status()).toBe(401);
});

test('проверка прав стоит раньше разбора тела', async ({ request }) => {
  const res = await request.patch('/api/admin/marketing-anfrage', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(401);
});

test('админка маркетинга без сессии не открывается', async ({ request }) => {
  const res = await request.get('/admin/marketing', { maxRedirects: 0 });
  expect([307, 302, 303]).toContain(res.status());
});
