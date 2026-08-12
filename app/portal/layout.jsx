import { redirect } from 'next/navigation';
import { currentCompany } from '../../lib/auth';
import LogoutButton from './logout-button';
import SiteFooter from '../site-footer';

export const dynamic = 'force-dynamic';

/**
 * Гард кабинета. Проверка на сервере, до отрисовки: страница с данными
 * компании не должна доехать до браузера человека, у которого нет доступа,
 * даже на мгновение.
 *
 * Роуты проверяют права отдельно и сами — этот гард закрывает страницы,
 * а не данные. Полагаться только на него нельзя: API доступен и напрямую.
 */
export default async function PortalLayout({ children }) {
  const session = await currentCompany();
  if (!session) redirect('/');

  return (
    <div style={S.app}>
      <header style={S.top}>
        <div>
          <div style={S.mark}>
            MOTO-<span style={{ color: 'var(--signal)' }}>ZÜRICH</span>
          </div>
          <div style={S.sub}>Ausstellerportal</div>
        </div>
        <div style={S.who}>
          <span style={S.email}>{session.user.email}</span>
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
    background: 'var(--ink)',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  mark: { color: '#fff', fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px' },
  sub: {
    marginTop: 4,
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#93a9c6',
  },
  who: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 },
  email: { color: '#c6d4e6', fontSize: 13 },
  wrap: { padding: '26px 28px 70px', maxWidth: 1180 },
};
