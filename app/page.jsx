import { redirect } from 'next/navigation';
import LoginForm from './login-form';
import SiteFooter from './site-footer';
import { currentCompany } from '../lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Экран входа. Уже вошедшего сюда пускать незачем — сразу в кабинет.
 */
export default async function LoginPage() {
  const session = await currentCompany();
  if (session) redirect('/portal');

  return (
    <main style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.mark}>
            MOTO-<span style={styles.markAccent}>ZÜRICH</span>
          </div>
          <div style={styles.sub}>Ausstellerportal</div>
        </div>

        <h1 style={styles.h1}>Anmelden</h1>
        <p style={styles.lead}>
          Das Portal ist für angemeldete Ausstellerinnen und Aussteller der MOTO-ZÜRICH 2027.
          Sie erhalten einen Code an Ihre hinterlegte E-Mail-Adresse.
        </p>

        <LoginForm />

        <p style={styles.foot}>
          <a href="/hallenplan" className="tap">Freie Standflächen ansehen</a>
        </p>
        <p style={styles.foot}>
          <a href="/prototyp" className="tap">Prototyp des Portals ansehen</a>
        </p>
      </div>

      <div style={styles.event}>19.–21. Februar 2027 · StageOne und Halle 550, Zürich-Oerlikon</div>
      <SiteFooter />
    </main>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: '40px 20px',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '28px 28px 22px',
  },
  brand: {
    background: 'var(--ink)',
    margin: '-28px -28px 24px',
    padding: '20px 28px 16px',
  },
  mark: { color: '#fff', fontSize: 19, fontWeight: 700, letterSpacing: '-0.4px' },
  markAccent: { color: 'var(--signal)' },
  sub: {
    marginTop: 6,
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#93a9c6',
  },
  h1: { fontSize: 24, letterSpacing: '-0.5px', margin: '0 0 6px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px' },
  foot: { marginTop: 16, marginBottom: 0, fontSize: 13 },
  event: { fontSize: 12, color: 'var(--muted)' },
};
