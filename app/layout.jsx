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
      <body>{children}</body>
    </html>
  );
}
