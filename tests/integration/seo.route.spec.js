import { test, expect } from '@playwright/test';

/**
 * Integration: портал закрыт от поисковиков.
 *
 * Решение 2026-08-11: наружу портал не выставляем. Это рабочий инструмент,
 * поисковая витрина проекта — motozuerich.ch. Ссылки на план залов и на вход
 * рассылаются адресно.
 *
 * Тесты закрепляют именно закрытость: открыть индексацию можно только
 * осознанной правкой, которая уронит этот файл.
 */

test('план залов закрыт от индексации', async ({ request }) => {
  const html = await (await request.get('/hallenplan')).text();
  expect(html).toMatch(/<meta name="robots" content="noindex/);
});

test('вход закрыт от индексации', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toMatch(/<meta name="robots" content="noindex/);
});

test('юридическая страница закрыта от индексации', async ({ request }) => {
  const html = await (await request.get('/datenschutz')).text();
  expect(html).toMatch(/<meta name="robots" content="noindex/);
});

test('robots.txt запрещает обход целиком', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toMatch(/Disallow: \//);
});

test('карты сайта нет — индексировать нечего', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(404);
});

test('Open Graph остаётся: ссылку рассылают в письмах и мессенджерах', async ({ request }) => {
  // Это не про поиск, а про то, как выглядит карточка ссылки у получателя.
  const html = await (await request.get('/hallenplan')).text();
  expect(html).toMatch(/property="og:title"/);
  expect(html).toMatch(/property="og:description"/);
});
