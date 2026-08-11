/**
 * Экран входа. Этап 0 — только оболочка: разметка на месте, отправка ещё не
 * подключена, поэтому поле и кнопка отключены и об этом честно написано.
 * На этапе 1 сюда придёт запрос кода на почту (Supabase Auth) и форма оживёт.
 */
export default function LoginPage() {
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

        <form style={styles.form}>
          <label htmlFor="email" style={styles.label}>
            E-Mail-Adresse
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@firma.ch"
            disabled
            style={styles.input}
          />
          <button type="submit" disabled style={styles.button}>
            Code anfordern
          </button>
        </form>

        <p style={styles.notice} role="status">
          Der Login wird gerade eingerichtet und ist noch nicht aktiv.
        </p>

        <p style={styles.foot}>
          <a href="/prototyp">Prototyp des Portals ansehen</a>
        </p>
      </div>

      <div style={styles.event}>19.–21. Februar 2027 · StageOne und Halle 550, Zürich-Oerlikon</div>
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
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, color: 'var(--muted)' },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    background: '#fff',
  },
  button: {
    marginTop: 6,
    padding: '11px 14px',
    border: 0,
    borderRadius: 3,
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  notice: {
    marginTop: 18,
    marginBottom: 0,
    fontSize: 13,
    color: 'var(--warn)',
    border: '1px solid var(--warn)',
    borderRadius: 2,
    padding: '8px 10px',
  },
  foot: { marginTop: 16, marginBottom: 0, fontSize: 13 },
  event: { fontSize: 12, color: 'var(--muted)' },
};
