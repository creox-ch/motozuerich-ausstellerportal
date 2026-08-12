import { test, expect } from '@playwright/test';

/** Integration: активности закрыты без сессии. */

const ID = '11111111-2222-3333-4444-555555555555';

const ROUTEN = [
  ['POST', '/api/aktivitaeten', { titel: 'X', format: 'Workshop', tage: ['fr'] }],
  ['DELETE', '/api/aktivitaeten', { id: ID }],
  ['PATCH', '/api/admin/aktivitaeten', { id: ID, status: 'angenommen' }],
];

for (const [method, pfad, body] of ROUTEN) {
  test(`${method} ${pfad} без сессии → 401`, async ({ request }) => {
    const res = await request.fetch(pfad, { method, data: body });
    expect(res.status()).toBe(401);
  });
}

test('проверка прав стоит раньше разбора тела', async ({ request }) => {
  const res = await request.post('/api/aktivitaeten', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(401);
});

test('страницы активностей без сессии не открываются', async ({ request }) => {
  for (const pfad of ['/portal/aktivitaeten', '/admin/aktivitaeten']) {
    const res = await request.get(pfad, { maxRedirects: 0 });
    expect([307, 302, 303], pfad).toContain(res.status());
  }
});
