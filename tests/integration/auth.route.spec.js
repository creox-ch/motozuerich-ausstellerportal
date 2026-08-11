import { test, expect } from '@playwright/test';

/**
 * Integration: настоящие роуты входа через request-фикстуру, без мока.
 *
 * Проверяем только ветки ДО обращения к внешним сервисам — разбор тела,
 * формат адреса и кода, отсутствие сессии. Все внешние сервисы в
 * playwright.config.js заглушены, так что до живой базы или Resend
 * эти запросы не доходят и дойти не могут.
 *
 * Сам успешный вход этим слоем не проверяется: для него нужен настоящий
 * Supabase, см. tests/pgtap/README.md и ручной чек-лист в docs.
 */

test.describe('POST /api/auth/request-code', () => {
  test('не JSON → 400', async ({ request }) => {
    const res = await request.post('/api/auth/request-code', {
      headers: { 'content-type': 'application/json' },
      data: 'это не json',
    });
    expect(res.status()).toBe(400);
  });

  test('нет адреса → 400', async ({ request }) => {
    const res = await request.post('/api/auth/request-code', { data: {} });
    expect(res.status()).toBe(400);
    expect((await res.json()).ok).toBe(false);
  });

  test('кривой адрес → 400 с понятным текстом', async ({ request }) => {
    const res = await request.post('/api/auth/request-code', { data: { email: 'firma@' } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain('E-Mail');
  });
});

test.describe('POST /api/auth/verify', () => {
  test('кривой адрес → 400', async ({ request }) => {
    const res = await request.post('/api/auth/verify', { data: { email: 'x', code: '123456' } });
    expect(res.status()).toBe(400);
  });

  test('код не из цифр → 400', async ({ request }) => {
    const res = await request.post('/api/auth/verify', {
      data: { email: 'firma@example.ch', code: '12ab' },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain('Ziffern');
  });

  test('восьмизначный код доходит до проверки, а не отбивается по длине', async ({ request }) => {
    // Регрессия: длина была зашита как «ровно шесть», и настоящий код
    // Supabase (восемь цифр) отбивался ещё до обращения к Supabase.
    const res = await request.post('/api/auth/verify', {
      data: { email: 'firma@example.ch', code: '12345678' },
    });
    expect(res.status(), 'не должно быть 400 по формату').not.toBe(400);
  });

  test('код отсутствует → 400, а не попытка проверки пустоты', async ({ request }) => {
    const res = await request.post('/api/auth/verify', { data: { email: 'firma@example.ch' } });
    expect(res.status()).toBe(400);
  });
});

test.describe('доступ к данным компании', () => {
  test('/api/me без сессии → 401', async ({ request }) => {
    const res = await request.get('/api/me');
    expect(res.status()).toBe(401);
    expect((await res.json()).error).toContain('nicht angemeldet');
  });

  test('/api/me с подделанной cookie сессии → 401, а не 200', async ({ request }) => {
    // Cookie можно написать руками. Токен проверяется по подписи на стороне
    // Supabase, поэтому выдуманное значение внутрь не пускает.
    const res = await request.get('/api/me', {
      headers: { cookie: 'sb-access-token=fake; sb-refresh-token=fake' },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('страницы кабинета', () => {
  test('/portal без сессии не отдаёт 500', async ({ request }) => {
    // Регрессия: страница полагалась на гард в layout, а в Next 14 layout
    // и page рендерятся параллельно — страница выполнялась на пустой сессии
    // и падала. Браузер этого не показывал: редирект в итоге срабатывал,
    // и e2e-тест оставался зелёным поверх ошибки сервера.
    const res = await request.get('/portal', { maxRedirects: 0 });
    expect(res.status(), `получили ${res.status()}`).toBeLessThan(500);
  });
});

test.describe('POST /api/auth/logout', () => {
  test('выход отвечает ok даже без сессии', async ({ request }) => {
    // Кнопка «Выйти» не должна ломаться от того, что сессия уже истекла.
    const res = await request.post('/api/auth/logout');
    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  test('GET не выходит из системы', async ({ request }) => {
    // Иначе предпросмотр ссылки в почтовом клиенте выкидывал бы человека.
    const res = await request.get('/api/auth/logout');
    expect(res.status()).toBe(405);
  });
});
