import { test, expect } from '@playwright/test';

/**
 * Integration: публичная заявка на площадь.
 *
 * Роут открыт всем, поэтому проверяем именно то, что защищает его от мусора
 * и от записи без согласия. До базы эти ветки не доходят — внешние сервисы
 * в playwright.config заглушены.
 *
 * Ботам отвечаем «ок»: сказать «отклонено» означало бы подсказать автору
 * скрипта, что именно поправить.
 */

const VALID = {
  stand_id: 'D01',
  firma: 'Testfirma AG',
  name: 'Anna Muster',
  email: 'anna@example.ch',
  consent: true,
  elapsed_ms: 9000,
};

test('honeypot заполнен → 200 skipped, в базу не пишем', async ({ request }) => {
  const res = await request.post('/api/anfrage', {
    data: { ...VALID, website: 'http://spam.example' },
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, skipped: true });
});

test('форма заполнена быстрее человека → 200 skipped', async ({ request }) => {
  const res = await request.post('/api/anfrage', { data: { ...VALID, elapsed_ms: 300 } });
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, skipped: true });
});

test('без согласия → 400, заявка не сохраняется', async ({ request }) => {
  const res = await request.post('/api/anfrage', { data: { ...VALID, consent: false } });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toContain('Einwilligung');
});

test('согласие отсутствует вовсе → 400', async ({ request }) => {
  const { consent, ...ohne } = VALID;
  const res = await request.post('/api/anfrage', { data: ohne });
  expect(res.status()).toBe(400);
});

test('без фирмы или имени → 400', async ({ request }) => {
  expect((await request.post('/api/anfrage', { data: { ...VALID, firma: '  ' } })).status()).toBe(400);
  expect((await request.post('/api/anfrage', { data: { ...VALID, name: '' } })).status()).toBe(400);
});

test('кривая почта → 400', async ({ request }) => {
  const res = await request.post('/api/anfrage', { data: { ...VALID, email: 'anna@' } });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toContain('E-Mail');
});

test('не JSON → 400', async ({ request }) => {
  const res = await request.post('/api/anfrage', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(400);
});

test('порядок проверок: бот отсекается раньше валидации', async ({ request }) => {
  // У бота и почта кривая, и согласия нет — но ответ должен быть «ок»,
  // а не подсказка, что именно не так.
  const res = await request.post('/api/anfrage', {
    data: { website: 'spam', email: 'мусор', consent: false },
  });
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, skipped: true });
});
