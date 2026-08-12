import { test, expect } from '@playwright/test';

/**
 * Integration: документы и счета закрыты.
 *
 * Здесь проверяется, что дверь заперта вообще — сессии в этом слое нет.
 * Что вошедший экспонент не скачает чужой счёт, проверяется живым прогоном
 * (tests/live) и разбором в lib/dokumente: права там решает строка из базы,
 * а не идентификатор из запроса.
 */

const ADMIN_ROUTEN = [
  ['PATCH', '/api/admin/dokumente', { id: '11111111-2222-3333-4444-555555555555', bezahlt: true }],
  ['DELETE', '/api/admin/dokumente', { id: '11111111-2222-3333-4444-555555555555' }],
];

for (const [method, pfad, body] of ADMIN_ROUTEN) {
  test(`${method} ${pfad} без сессии → 401`, async ({ request }) => {
    const res = await request.fetch(pfad, { method, data: body });
    expect(res.status()).toBe(401);
  });
}

test('загрузка документа без сессии → 401', async ({ request }) => {
  const res = await request.post('/api/admin/dokumente', {
    multipart: {
      titel: 'Fremdes Dokument',
      art: 'dokument',
      file: { name: 'x.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
    },
  });
  expect(res.status()).toBe(401);
});

test('скачивание без сессии → 401, а не редирект на файл', async ({ request }) => {
  // Важно именно 401: редирект означал бы, что подписанную ссылку выдали
  // до проверки прав.
  const res = await request.get('/api/dokumente?id=11111111-2222-3333-4444-555555555555', {
    maxRedirects: 0,
  });
  expect(res.status()).toBe(401);
});

test('проверка прав стоит раньше разбора запроса', async ({ request }) => {
  // Кривой идентификатор без сессии обязан дать 401, а не 400: иначе по кодам
  // ответа выясняется формат данных, не имея доступа.
  const res = await request.get('/api/dokumente?id=nicht-mal-eine-uuid', { maxRedirects: 0 });
  expect(res.status()).toBe(401);
});

test('страница документов в админке без сессии не открывается', async ({ request }) => {
  const res = await request.get('/admin/dokumente', { maxRedirects: 0 });
  expect([307, 302, 303]).toContain(res.status());
});

test('раздел документов в кабинете без сессии не открывается', async ({ request }) => {
  const res = await request.get('/portal/dokumente', { maxRedirects: 0 });
  expect([307, 302, 303]).toContain(res.status());
});
