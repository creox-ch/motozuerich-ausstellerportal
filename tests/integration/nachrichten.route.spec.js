import { test, expect } from '@playwright/test';

/**
 * Integration: переписка закрыта.
 *
 * Сессии в этом слое нет, поэтому проверяется, что дверь заперта вообще
 * и что права проверяются раньше разбора тела.
 */

const FIRMA = '11111111-2222-3333-4444-555555555555';

test('экспонент без сессии не пишет → 401', async ({ request }) => {
  const res = await request.post('/api/nachrichten', { data: { text: 'Hallo' } });
  expect(res.status()).toBe(401);
});

test('Messeleitung без сессии не отвечает → 401', async ({ request }) => {
  const res = await request.post('/api/admin/nachrichten', {
    data: { company_id: FIRMA, text: 'Antwort' },
  });
  expect(res.status()).toBe(401);
});

test('проверка прав стоит раньше разбора тела', async ({ request }) => {
  // Кривое тело без сессии обязано дать 401, а не 400: иначе по кодам ответа
  // выясняется формат запроса, не имея доступа.
  for (const pfad of ['/api/nachrichten', '/api/admin/nachrichten']) {
    const res = await request.post(pfad, {
      headers: { 'content-type': 'application/json' },
      data: 'это не json',
    });
    expect(res.status(), pfad).toBe(401);
  }
});

test('страницы переписки без сессии не открываются', async ({ request }) => {
  for (const pfad of ['/portal/nachrichten', '/admin/nachrichten']) {
    const res = await request.get(pfad, { maxRedirects: 0 });
    expect([307, 302, 303], pfad).toContain(res.status());
  }
});
