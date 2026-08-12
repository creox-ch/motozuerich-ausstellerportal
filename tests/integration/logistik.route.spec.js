import { test, expect } from '@playwright/test';

/** Integration: логистика закрыта без сессии. */

const FIRMA = '11111111-2222-3333-4444-555555555555';

test('заявка без сессии → 401', async ({ request }) => {
  const res = await request.post('/api/logistik', { data: { parkkarten: 2 } });
  expect(res.status()).toBe(401);
});

test('назначение окна без сессии → 401', async ({ request }) => {
  const res = await request.patch('/api/admin/logistik', {
    data: { company_id: FIRMA, an_fenster: 'Mi 08:00' },
  });
  expect(res.status()).toBe(401);
});

test('проверка прав стоит раньше разбора тела', async ({ request }) => {
  for (const pfad of ['/api/logistik', '/api/admin/logistik']) {
    const res = await request.fetch(pfad, {
      method: pfad.includes('admin') ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      data: 'это не json',
    });
    expect(res.status(), pfad).toBe(401);
  }
});

test('страницы логистики без сессии не открываются', async ({ request }) => {
  for (const pfad of ['/portal/anreise', '/admin/logistik']) {
    const res = await request.get(pfad, { maxRedirects: 0 });
    expect([307, 302, 303], pfad).toContain(res.status());
  }
});
