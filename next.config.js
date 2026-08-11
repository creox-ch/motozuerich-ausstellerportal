/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Прототип лежит как статический файл public/prototyp.html и по умолчанию
  // открывался бы только по адресу с расширением. Отдаём его по чистому
  // /prototyp — на прототип уже могли давать ссылки.
  async rewrites() {
    return [{ source: '/prototyp', destination: '/prototyp.html' }];
  },
};

module.exports = nextConfig;
