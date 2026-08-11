import { test, expect } from '@playwright/test';

/**
 * Integration: роут профиля без сессии.
 *
 * Смысл в том, что проверка прав стоит ПЕРВОЙ — раньше разбора тела
 * и раньше валидации. Роут, который сначала разбирает тело, а права
 * проверяет потом, отвечает по-разному на разный ввод и тем самым
 * рассказывает постороннему, что внутри.
 *
 * Разграничение по компаниям здесь не проверить — нужна настоящая сессия.
 * Это делает живая проверка, см. ручной чек-лист в docs.
 */

const VALID = { name: 'Fremdfirma AG' };

test('GET без сессии → 401', async ({ request }) => {
  const res = await request.get('/api/profile');
  expect(res.status()).toBe(401);
});

test('PUT без сессии → 401', async ({ request }) => {
  const res = await request.put('/api/profile', { data: VALID });
  expect(res.status()).toBe(401);
});

test('PUT с кривым телом без сессии → всё равно 401, а не 400', async ({ request }) => {
  // Если бы вернулось 400, посторонний узнал бы, что тело вообще разбирают —
  // и мог бы по кодам ответа нащупать формат данных.
  const res = await request.put('/api/profile', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(401);
});

test('PUT с чужим company_id в теле без сессии → 401', async ({ request }) => {
  const res = await request.put('/api/profile', {
    data: { ...VALID, id: '00000000-0000-0000-0000-000000000000' },
  });
  expect(res.status()).toBe(401);
});

test('страница профиля без входа не открывается', async ({ request }) => {
  const res = await request.get('/portal/profil', { maxRedirects: 0 });
  expect(res.status()).toBeLessThan(500);
  expect([307, 302, 303]).toContain(res.status());
});
