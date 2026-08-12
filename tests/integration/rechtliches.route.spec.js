import { test, expect } from '@playwright/test';

/**
 * Integration: юридические страницы и футер.
 *
 * Ссылки на Datenschutz и Impressum должны быть доступны с КАЖДОЙ страницы,
 * а не только там, где о них вспомнили. Разъехавшиеся футеры — обычная
 * причина того, что на одной странице ссылка есть, а на соседней нет,
 * и заметить это по одной странице невозможно.
 */

const OEFFENTLICH = ['/', '/hallenplan', '/datenschutz', '/impressum'];

for (const pfad of OEFFENTLICH) {
  test(`${pfad}: в футере есть обе юридические ссылки`, async ({ request }) => {
    const html = await (await request.get(pfad)).text();
    expect(html).toContain('href="/datenschutz"');
    expect(html).toContain('href="/impressum"');
  });
}

test('обе страницы открываются', async ({ request }) => {
  for (const pfad of ['/datenschutz', '/impressum']) {
    const res = await request.get(pfad);
    expect(res.status(), pfad).toBe(200);
  }
});

test('на обеих стоит пометка «черновик»', async ({ request }) => {
  // Пока текст не прошёл вычитку, человек должен это видеть, а не догадываться.
  // Пометку убирать вместе с вычиткой — см. docs/rechtliches-review.md.
  for (const pfad of ['/datenschutz', '/impressum']) {
    const html = await (await request.get(pfad)).text();
    expect(html, pfad).toContain('Entwurf');
  }
});

test('юридические страницы закрыты от индексации, как и весь портал', async ({ request }) => {
  for (const pfad of ['/datenschutz', '/impressum']) {
    const html = await (await request.get(pfad)).text();
    expect(html, pfad).toMatch(/<meta name="robots" content="noindex/);
  }
});
