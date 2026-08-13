'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Обмен контакта на показ цен.
 *
 * Что здесь важно для продажи, а не для кода:
 *
 * Спрашиваем компанию, а не только почту. В B2B `info@` не говорит ни о чём,
 * а название фирмы превращает список адресов в список, с которым можно
 * работать. Два поля вместо одного стоят почти ничего — в отличие от анкеты
 * на десять строк, после которой уходят.
 *
 * Говорим прямо, что будет дальше: цена появится сразу и придёт письмом.
 * Обещание, выполняющееся за секунду, — единственная причина, по которой
 * человек оставляет настоящий адрес, а не `a@b.c`.
 *
 * Согласие на новости — отдельная галочка и не проставлена заранее. Галочка,
 * стоящая по умолчанию, согласием не является.
 */
export default function PreisGate({ stand }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const started = useRef(Date.now());

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/preis-freischalten', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          stand_id: stand?.id || '',
          firma: fd.get('firma') || '',
          email: fd.get('email') || '',
          consent: fd.get('consent') === 'on',
          marketing_consent: fd.get('marketing_consent') === 'on',
          website: fd.get('website') || '',
          elapsed_ms: Date.now() - started.current,
          source_url: window.location.href,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        // Цены считает сервер, поэтому просто просим его перерисовать
        // страницу: она вернётся уже с суммами.
        router.refresh();
      } else {
        setError(data.error || 'Etwas ist schiefgelaufen.');
      }
    } catch {
      setError('Keine Verbindung. Bitte versuchen Sie es erneut.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={S.box}>
      <p style={S.titel}>Preise ansehen</p>
      <p style={S.text}>
        Preise und enthaltene Leistungen zeigen wir Ihnen direkt hier — und schicken sie
        Ihnen zusätzlich per E-Mail.
      </p>

      <label htmlFor="gate-firma" style={S.label}>
        Firma <span style={{ color: '#A32A25' }}>*</span>
      </label>
      <input
        id="gate-firma"
        name="firma"
        required
        autoComplete="organization"
        style={S.input}
      />

      <label htmlFor="gate-email" style={S.label}>
        Geschäfts-E-Mail <span style={{ color: '#A32A25' }}>*</span>
      </label>
      <input
        id="gate-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        style={S.input}
      />

      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label htmlFor="gate-website">Website</label>
        <input id="gate-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label style={S.consent}>
        <input type="checkbox" name="consent" required />
        <span>
          Einverstanden, dass meine Angaben zur Bearbeitung gespeichert werden.{' '}
          <a href="/datenschutz" target="_blank" rel="noopener">
            Datenschutz
          </a>
        </span>
      </label>

      <label style={S.consent}>
        <input type="checkbox" name="marketing_consent" />
        <span>Neuigkeiten zur MOTO-ZÜRICH erhalten. Jederzeit abbestellbar.</span>
      </label>

      <button type="submit" disabled={busy} style={S.button}>
        {busy ? 'Einen Moment…' : 'Preise anzeigen'}
      </button>

      {error && <p style={S.error}>{error}</p>}
    </form>
  );
}

const S = {
  box: {
    marginTop: 14,
    padding: '14px 15px',
    background: '#F8FAFD',
    border: '1px solid var(--line)',
    borderRadius: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  titel: { margin: 0, fontWeight: 700, fontSize: 14 },
  text: { margin: '4px 0 8px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 },
  label: { fontSize: 12, color: 'var(--muted)', marginTop: 6 },
  input: {
    padding: '8px 10px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    width: '100%',
    fontSize: 14,
    minHeight: 44,
    color: 'var(--ink)',
  },
  consent: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    fontSize: 11,
    color: 'var(--muted)',
    marginTop: 10,
    lineHeight: 1.45,
  },
  button: {
    marginTop: 12,
    padding: '11px 14px',
    border: 0,
    borderRadius: 3,
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 44,
  },
  error: { fontSize: 12, color: '#A32A25', marginTop: 8 },
};
