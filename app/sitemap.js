const BASE = process.env.PUBLIC_BASE_URL || 'https://motozuerich-ausstellerportal.vercel.app';

/**
 * В карту сайта попадает только то, что должно индексироваться. Сейчас это
 * одна страница — витрина. Кабинет за входом, прототип с выдуманными цифрами
 * и юридическая страница в поиске не нужны.
 */
export default function sitemap() {
  return [
    {
      url: `${BASE}/hallenplan`,
      changeFrequency: 'daily', // статусы площадок меняются по мере продажи
      priority: 1,
    },
  ];
}
