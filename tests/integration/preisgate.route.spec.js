import { test, expect } from '@playwright/test';

/**
 * Integration: гейт цен.
 *
 * Главная проверка здесь — последняя: цена не должна попадать в разметку,
 * пока контакт не оставлен. Гейт, прячущий цену стилями или условием в JSX
 * поверх уже отданных данных, обходится за две секунды — и краснеть должно
 * именно на этом, а не на том, что кнопка называется иначе.
 */

test('без согласия цены не открываются', async ({ request }) => {
  const res = await request.post('/api/preis-freischalten', {
    data: {
      email: 'jemand@example.ch',
      firma: 'Example AG',
      consent: false,
      elapsed_ms: 9000,
    },
  });
  expect(res.status()).toBe(400);
});

test('без компании не открываются', async ({ request }) => {
  const res = await request.post('/api/preis-freischalten', {
    data: { email: 'jemand@example.ch', firma: '', consent: true, elapsed_ms: 9000 },
  });
  expect(res.status()).toBe(400);
});

test('бот получает «ок» и не узнаёт, что раскрыт', async ({ request }) => {
  const res = await request.post('/api/preis-freischalten', {
    data: {
      email: 'bot@example.ch',
      firma: 'Bot AG',
      consent: true,
      website: 'http://spam',
      elapsed_ms: 9000,
    },
  });
  expect(res.status()).toBe(200);
  expect((await res.json()).ok).toBe(true);
});

test('кривое тело → 400, а не падение', async ({ request }) => {
  const res = await request.post('/api/preis-freischalten', {
    headers: { 'content-type': 'application/json' },
    data: 'это не json',
  });
  expect(res.status()).toBe(400);
});

test('цена не попадает в разметку, пока контакт не оставлен', async ({ request }) => {
  // Каталог Halle D открыт всем: размеры, статусы, номера площадок.
  // А суммы — нет. Проверяем по телу ответа, а не по внешнему виду.
  const res = await request.get('/hallenplan');
  const html = await res.text();

  expect(res.status()).toBe(200);
  // Страница действительно отрисовалась, а не отдала пустую заглушку —
  // иначе проверки ниже прошли бы вхолостую.
  expect(html).toContain('Hallenplan');

  // Ни одной суммы из прайса Halle D.
  for (const betrag of ["13'400", "8'450", "4'000", '13400', '8450']) {
    expect(html, `сумма ${betrag} утекла в разметку`).not.toContain(betrag);
  }
  // И ни одного признака открытых цен.
  expect(html).not.toContain('exkl. MwSt.');
});
