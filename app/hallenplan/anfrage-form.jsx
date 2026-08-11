'use client';

import { useRef, useState } from 'react';

/**
 * Заявка на площадь с публичной страницы.
 *
 * Три слоя защиты от ботов, как на остальных формах платформы: honeypot,
 * замер времени заполнения и проверка на сервере. Ловушка обязана иметь
 * атрибут name — без него автозаполнение браузера однажды съело живой лид.
 *
 * Согласие обязательно и не проставлено заранее: галочка, стоящая по
 * умолчанию, согласием не является.
 */
export default function AnfrageForm({ stand }) {
  const [state, setState] = useState('form'); // form | sent
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const started = useRef(Date.now());

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          stand_id: stand.id,
          firma: fd.get('firma') || '',
          name: fd.get('name') || '',
          email: fd.get('email') || '',
          telefon: fd.get('telefon') || '',
          nachricht: fd.get('nachricht') || '',
          consent: fd.get('consent') === 'on',
          website: fd.get('website') || '',
          elapsed_ms: Date.now() - started.current,
          source_url: window.location.href,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) setState('sent');
      else setError(data.error || 'Etwas ist schiefgelaufen.');
    } catch {
      setError('Keine Verbindung. Bitte versuchen Sie es erneut.');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'sent') {
    return (
      <div style={S.done} role="status">
        <strong>Danke, Ihre Anfrage ist bei uns.</strong>
        <p style={S.doneText}>
          Die Messeleitung meldet sich bei Ihnen. Die Anfrage reserviert die Fläche
          unverbindlich — Offerte und Vertrag folgen separat.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={S.form}>
      <p style={S.intro}>Anfrage für Stand {stand.id}</p>

      <Field name="firma" label="Firma" required />
      <Field name="name" label="Ansprechperson" required />
      <Field name="email" label="E-Mail" type="email" required />
      <Field name="telefon" label="Telefon" />

      <label htmlFor="nachricht" style={S.label}>Nachricht</label>
      <textarea id="nachricht" name="nachricht" rows={3} style={S.input} />

      {/* Ловушка для ботов. Человеку не видна и не доступна с клавиатуры. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label style={S.consent}>
        <input type="checkbox" name="consent" required />
        <span>
          Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert
          und verwendet werden. Details in der <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a>.
        </span>
      </label>

      <button type="submit" disabled={busy} style={S.button}>
        {busy ? 'Wird gesendet…' : 'Anfrage senden'}
      </button>

      {error && <p style={S.error}>{error}</p>}
    </form>
  );
}

function Field({ name, label, type = 'text', required }) {
  return (
    <>
      <label htmlFor={name} style={S.label}>
        {label}
        {required && <span style={{ color: '#A32A25' }}> *</span>}
      </label>
      <input id={name} name={name} type={type} required={required} style={S.input} />
    </>
  );
}

const S = {
  form: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 },
  intro: { fontWeight: 700, margin: '0 0 8px', fontSize: 14 },
  label: { fontSize: 12, color: 'var(--muted)', marginTop: 6 },
  input: { padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 3, width: '100%', fontSize: 14 },
  consent: { display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.45 },
  button: { marginTop: 12, padding: '11px 14px', border: 0, borderRadius: 3, background: 'var(--blue)', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  error: { fontSize: 12, color: '#A32A25', marginTop: 8 },
  done: { marginTop: 16, padding: '12px 14px', border: '1px solid #1B7A5A', borderRadius: 3, fontSize: 13 },
  doneText: { margin: '6px 0 0', color: 'var(--muted)' },
};
