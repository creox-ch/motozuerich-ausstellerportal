import { test, expect } from '@playwright/test';

/**
 * Integration: роут приёма Ausstellungsbedingungen без сессии.
 *
 * Проверяется то же, что и у соседних роутов: права стоят ПЕРВЫМИ — раньше
 * разбора тела и раньше валидации. Роут, который сначала разбирает тело,
 * отвечает по-разному на разный ввод и тем самым рассказывает постороннему,
 * что внутри.
 *
 * Здесь у этого правила есть отдельная цена: акцепт пишется в компанию,
 * которая берётся ИЗ СЕССИИ. Если бы её можно было назвать в теле запроса,
 * посторонний подписал бы условия за чужую фирму.
 *
 * Разграничение по компаниям с настоящей сессией здесь не проверить —
 * это ручной чек-лист, docs/testplan-manuell.md.
 */

const VOLLSTAENDIG = {
  name: 'Max Muster',
  funktion: 'Geschäftsführer',
  punkte: [true, true, true, true],
};

test('POST без сессии → 401', async ({ request }) => {
  const res = await request.post('/api/agb', { data: VOLLSTAENDIG });
  expect(res.status()).toBe(401);
});

test('POST с кривым телом без сессии → всё равно 401, а не 400', async ({ request }) => {
  const res = await request.post('/api/agb', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(401);
});

test('POST с чужой компанией в теле без сессии → 401', async ({ request }) => {
  // Компания приходит только из сессии. Тело её не задаёт и задать не может.
  const res = await request.post('/api/agb', {
    data: { ...VOLLSTAENDIG, companyId: '00000000-0000-0000-0000-000000000000' },
  });
  expect(res.status()).toBe(401);
});

test('POST без галочек без сессии → 401, а не 400', async ({ request }) => {
  // Порядок проверок: права раньше валидации. Иначе по кодам ответа видно,
  // какие поля роут ждёт.
  const res = await request.post('/api/agb', { data: { name: '', funktion: '', punkte: [] } });
  expect(res.status()).toBe(401);
});

test('страница с текстом условий открыта без входа', async ({ request }) => {
  // Условия человек должен прочитать до того, как получит доступ, — и после
  // того, как доступ закончится. Логин здесь был бы препятствием, а не защитой.
  const res = await request.get('/agb');
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain('Ausstellungsbedingungen');
  expect(html).toContain('Creox GmbH');
});

test('кабинет по-прежнему закрыт', async ({ request }) => {
  const res = await request.get('/portal', { maxRedirects: 0 });
  expect([307, 302, 303]).toContain(res.status());
});
