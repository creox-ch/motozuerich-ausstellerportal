import { test, expect } from '@playwright/test';

/**
 * Integration: админка закрыта.
 *
 * Проверяем без сессии — что дверь заперта вообще. Отдельный вопрос,
 * не пускает ли она вошедшего экспонента: это проверяется живым прогоном
 * с настоящей сессией, здесь такой не создать.
 *
 * Различие 401 и 403 существенно: «не вошёл» и «вошёл, но не сюда» — разные
 * ситуации, и в логах их надо отличать.
 */

const ROUTEN = [
  ['POST', '/api/admin/companies', { name: 'Fremdfirma AG' }],
  ['POST', '/api/admin/zugang', { email: 'a@b.ch', company_id: '11111111-2222-3333-4444-555555555555' }],
  ['PATCH', '/api/admin/zugang', { email: 'a@b.ch', aktiv: false }],
  ['PATCH', '/api/admin/stands', { id: 'D01', status: 'gesperrt' }],
  ['PATCH', '/api/admin/anfragen', { id: 'x', status: 'spam' }],
];

for (const [method, pfad, body] of ROUTEN) {
  test(`${method} ${pfad} без сессии → 401`, async ({ request }) => {
    const res = await request.fetch(pfad, { method, data: body });
    expect(res.status()).toBe(401);
  });
}

test('страницы админки без сессии не открываются', async ({ request }) => {
  for (const pfad of ['/admin', '/admin/flaechen']) {
    const res = await request.get(pfad, { maxRedirects: 0 });
    expect([307, 302, 303], pfad).toContain(res.status());
  }
});

test('проверка прав стоит раньше разбора тела', async ({ request }) => {
  // Иначе по кодам ответа можно нащупать формат данных, не имея доступа.
  const res = await request.post('/api/admin/companies', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(401);
});
