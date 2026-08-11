'use client';

import { useState } from 'react';

/**
 * Вход в два шага: почта → код.
 *
 * Состояние держим здесь, а не в адресе страницы: адрес с почтой в параметрах
 * попадает в историю браузера и в логи прокси, а это персональные данные.
 */
export default function LoginForm() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // {type: 'info'|'error', text}

  async function requestCode(e) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.allowed) {
        setStep('code');
        setMessage({ type: 'info', text: 'Wir haben Ihnen einen Code geschickt.' });
      } else if (res.ok && data.allowed === false) {
        setMessage({
          type: 'error',
          text: 'Diese Adresse ist für das Portal nicht freigegeben. Bitte wenden Sie sich an die Messeleitung.',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Etwas ist schiefgelaufen.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Keine Verbindung. Bitte versuchen Sie es erneut.' });
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        // Полная перезагрузка, а не router.push: серверный гард кабинета должен
        // увидеть свежую cookie сессии.
        window.location.href = '/portal';
        return;
      }
      setMessage({ type: 'error', text: data.error || 'Code ungültig oder abgelaufen.' });
    } catch {
      setMessage({ type: 'error', text: 'Keine Verbindung. Bitte versuchen Sie es erneut.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {step === 'email' ? (
        <form onSubmit={requestCode} style={S.form}>
          <label htmlFor="email" style={S.label}>
            E-Mail-Adresse
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@firma.ch"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            style={S.input}
          />
          <button type="submit" disabled={busy} style={S.button}>
            {busy ? 'Einen Moment…' : 'Code anfordern'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} style={S.form}>
          <label htmlFor="code" style={S.label}>
            Code aus der E-Mail
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="12345678"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy}
            style={{ ...S.input, letterSpacing: '.28em', fontFamily: 'monospace', fontSize: 18 }}
          />
          <button type="submit" disabled={busy} style={S.button}>
            {busy ? 'Einen Moment…' : 'Anmelden'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('email');
              setCode('');
              setMessage(null);
            }}
            style={S.linkButton}
          >
            Andere E-Mail-Adresse verwenden
          </button>
        </form>
      )}

      {message && (
        <p role="status" style={message.type === 'error' ? S.error : S.info}>
          {message.text}
        </p>
      )}
    </>
  );
}

const S = {
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
  linkButton: {
    marginTop: 4,
    padding: 0,
    border: 0,
    background: 'none',
    color: 'var(--blue)',
    fontSize: 13,
    textAlign: 'left',
    cursor: 'pointer',
  },
  info: {
    marginTop: 16,
    marginBottom: 0,
    fontSize: 13,
    color: 'var(--text)',
    background: '#EEF4FC',
    border: '1px solid var(--line)',
    borderRadius: 2,
    padding: '9px 11px',
  },
  error: {
    marginTop: 16,
    marginBottom: 0,
    fontSize: 13,
    color: '#A32A25',
    border: '1px solid #A32A25',
    borderRadius: 2,
    padding: '9px 11px',
  },
};
