/**
 * Общий футер с юридическими страницами.
 *
 * Один компонент на все страницы — и публичные, и кабинет: ссылки на
 * Datenschutz и Impressum должны быть доступны отовсюду, а не только там,
 * где о них вспомнили. Разъехавшиеся футеры — обычная причина того, что
 * на одной странице ссылка есть, а на соседней нет.
 */
export default function SiteFooter() {
  return (
    <footer style={S.footer}>
      <span>MOTO-ZÜRICH 2027 · 19.–21. Februar 2027</span>
      <nav style={S.nav}>
        <a href="/impressum" className="tap">
          Impressum
        </a>
        <a href="/datenschutz" className="tap">
          Datenschutz
        </a>
      </nav>
    </footer>
  );
}

const S = {
  footer: {
    borderTop: '1px solid var(--line)',
    marginTop: 40,
    padding: '16px 28px 28px',
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'center',
    fontSize: 12,
    color: 'var(--muted)',
  },
  nav: { display: 'flex', gap: 16, marginLeft: 'auto', flexWrap: 'wrap' },
};
