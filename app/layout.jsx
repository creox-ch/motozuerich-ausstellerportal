import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata = {
  title: 'Ausstellerportal · MOTO-ZÜRICH 2027',
  description:
    'Portal für Ausstellerinnen und Aussteller der MOTO-ZÜRICH 2027, 19.–21. Februar 2027, StageOne und Halle 550, Zürich-Oerlikon.',
  // По умолчанию всё закрыто от поиска: за входом личные данные компаний.
  // Публичные страницы открывают индексацию у себя явно — так новая страница
  // по умолчанию оказывается закрытой, а не открытой по недосмотру.
  // Обратный порядок уже подвёл: витрина унаследовала noindex и была
  // невидима в поиске, хотя её задача — чтобы её находили.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        {children}
        {/*
          Vercel Web Analytics — соглашение платформы для всех сайтов.
          Кук не ставит и отдельных людей не отслеживает, поэтому не требует
          баннера согласия.

          Нужен по прямому уроку сезона 2026: продажи тогда не измерялись
          вообще, ни одного события конверсии, и посчитать отдачу было
          невозможно. Если план залов включат осенью без счётчика, мы снова
          не узнаем, сработал он или нет.

          Данные появятся только после включения Web Analytics в дашборде
          проекта — до этого скрипт отдаёт 404, и это нормально.
        */}
        <Analytics />
      </body>
    </html>
  );
}
