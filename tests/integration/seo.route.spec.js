import { test, expect } from '@playwright/test';

/**
 * Integration: что видно поисковикам.
 *
 * Регрессия, найденная на проде: витрина унаследовала noindex от общего
 * каркаса и была невидима в поиске — при том что её единственная задача
 * в том, чтобы её находили. Ошибка молчаливая: страница открывается,
 * выглядит правильно, и заметить это можно только заглянув в метатеги.
 *
 * Принцип закреплён обратный: по умолчанию закрыто, открываем осознанно.
 */

test('витрина открыта для индексации', async ({ request }) => {
  const html = await (await request.get('/hallenplan')).text();
  expect(html).toMatch(/<meta name="robots" content="index, follow"/);
});

test('витрина называет канонический адрес', async ({ request }) => {
  const html = await (await request.get('/hallenplan')).text();
  expect(html).toMatch(/<link rel="canonical" href="https?:\/\/[^"]+\/hallenplan"/);
});

test('витрина имеет Open Graph для ссылок в мессенджерах', async ({ request }) => {
  const html = await (await request.get('/hallenplan')).text();
  expect(html).toMatch(/property="og:title"/);
  expect(html).toMatch(/property="og:description"/);
});

test('вход закрыт от индексации', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toMatch(/<meta name="robots" content="noindex/);
});

test('юридическая страница закрыта от индексации', async ({ request }) => {
  const html = await (await request.get('/datenschutz')).text();
  expect(html).toMatch(/<meta name="robots" content="noindex/);
});

test('robots.txt пускает только витрину', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toContain('Allow: /hallenplan');
  expect(txt).toContain('Disallow: /portal');
  // Прототип полон демонстрационных цифр — в поиске ему делать нечего.
  expect(txt).toContain('Disallow: /prototyp');
  expect(txt).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
});

test('в карте сайта только витрина', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('/hallenplan');
  expect(xml).not.toContain('/portal');
  expect(xml).not.toContain('/prototyp');
});
