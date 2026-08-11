const BASE = process.env.PUBLIC_BASE_URL || 'https://motozuerich-ausstellerportal.vercel.app';

/**
 * Индексируется ровно одна страница — витрина с планом залов. Всё остальное
 * закрыто: кабинет, вход, служебные роуты и прототип.
 *
 * Прототип закрыт отдельным правилом не случайно: он полон демонстрационных
 * цифр и красных пометок «ещё не определено». Попади он в поиск — люди
 * читали бы выдуманные условия участия как настоящие.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/hallenplan',
        disallow: ['/', '/portal', '/api', '/prototyp', '/prototyp.html', '/datenschutz'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
