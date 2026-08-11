import './globals.css';

export const metadata = {
  title: 'Ausstellerportal · MOTO-ZÜRICH 2027',
  description:
    'Portal für Ausstellerinnen und Aussteller der MOTO-ZÜRICH 2027, 19.–21. Februar 2027, StageOne und Halle 550, Zürich-Oerlikon.',
  // Кабинет не должен попадать в поиск: за входом личные данные компаний.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
