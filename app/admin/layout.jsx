import { requirePageStaff } from '../../lib/auth';
import LogoutButton from '../portal/logout-button';
import SiteFooter from '../site-footer';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Messeleitung · Ausstellerportal',
};

/**
 * Админка Messeleitung.
 *
 * Гард стоит и здесь, и в каждой странице отдельно: в Next 14 layout и page
 * рендерятся параллельно, поэтому решение layout перенаправить не мешает
 * странице выполниться. На кабинете это уже обожгло.
 */
export default async function AdminLayout({ children }) {
  const staff = await requirePageStaff();

  return (
    <div style={S.app}>
      <header style={S.top}>
        <div>
          <div style={S.mark}>
            MOTO-<span style={{ color: 'var(--signal)' }}>ZÜRICH</span>
          </div>
          <div style={S.sub}>Messeleitung</div>
        </div>
        <nav style={S.nav}>
          <a href="/admin" style={S.link} className="tap">
            Übersicht
          </a>
          <a href="/admin/flaechen" style={S.link} className="tap">
            Flächen
          </a>
          <a href="/admin/dokumente" style={S.link} className="tap">
            Dokumente
          </a>
        </nav>
        <div style={S.who}>
          <span style={S.email}>{staff.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main style={S.wrap}>{children}</main>
      <SiteFooter />
    </div>
  );
}

const S = {
  app: { minHeight: '100vh' },
  top: {
    background: '#12253F',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  mark: { color: '#fff', fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px' },
  sub: {
    marginTop: 4,
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#FBF142',
  },
  nav: { display: 'flex', gap: 16 },
  link: { color: '#c6d4e6', fontSize: 14, textDecoration: 'none' },
  who: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 },
  email: { color: '#c6d4e6', fontSize: 13 },
  wrap: { padding: '26px 28px 70px', maxWidth: 1180 },
};
