'use client';

import { useState } from 'react';
import { MAX_LAENGE } from '../../../lib/nachrichten';

/**
 * Лента и форма отправки.
 *
 * Отправленное сообщение дописывается в ленту сразу, без перезагрузки: иначе
 * человек не видит, ушло ли оно, и отправляет второй раз. Ответ роута — та
 * самая строка из базы, а не наша догадка о ней.
 */
export default function NachrichtenClient({ nachrichten }) {
  const [liste, setListe] = useState(nachrichten);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function senden(event) {
    event.preventDefault();
    if (!text.trim()) return;

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/nachrichten', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && data.nachricht) {
        setListe((alt) => [...alt, data.nachricht]);
        setText('');
      } else {
        setMessage(data.error || 'Konnte nicht gesendet werden.');
      }
    } catch {
      setMessage('Keine Verbindung.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={S.wrap}>
      {liste.length === 0 ? (
        <p style={S.empty}>
          Noch keine Nachrichten. Schreiben Sie uns — wir antworten in der Regel innerhalb
          von zwei Arbeitstagen.
        </p>
      ) : (
        <ul style={S.list}>
          {liste.map((n) => {
            const vonUns = n.von === 'messeleitung';
            return (
              <li key={n.id} style={{ ...S.item, ...(vonUns ? S.itemUns : S.itemIhr) }}>
                <div style={S.meta}>
                  {vonUns ? 'Messeleitung' : n.autor_email}
                  {' · '}
                  {new Date(n.created_at).toLocaleString('de-CH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div style={S.text}>{n.text}</div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={senden} style={S.form}>
        <label htmlFor="nachricht" style={S.label}>
          Ihre Nachricht
        </label>
        <textarea
          id="nachricht"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LAENGE}
          rows={4}
          style={S.textarea}
          placeholder="Ihre Frage an die Messeleitung"
        />
        <div style={S.actions}>
          <span style={S.counter}>
            {text.length} / {MAX_LAENGE}
          </span>
          <button type="submit" disabled={busy || !text.trim()} style={S.btn}>
            Senden
          </button>
        </div>
        {message && (
          <p role="status" style={S.err}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

const S = {
  wrap: { maxWidth: 720 },
  list: { listStyle: 'none', margin: '0 0 18px', padding: 0, display: 'grid', gap: 10 },
  item: { border: '1px solid var(--line)', borderRadius: 3, padding: '12px 14px', background: '#fff' },
  itemUns: { borderLeft: '3px solid var(--signal)' },
  itemIhr: { borderLeft: '3px solid var(--line)' },
  meta: { fontSize: 12, color: 'var(--muted)', marginBottom: 5 },
  text: { fontSize: 14, whiteSpace: 'pre-wrap' },
  empty: { fontSize: 13, color: 'var(--muted)', margin: '0 0 18px' },
  form: { background: '#fff', border: '1px solid var(--line)', borderRadius: 3, padding: '16px 18px' },
  label: { display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 },
  counter: { fontSize: 12, color: 'var(--muted)' },
  btn: {
    marginLeft: 'auto',
    padding: '10px 20px',
    border: 0,
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 3,
    cursor: 'pointer',
    minHeight: 44,
  },
  err: { fontSize: 13, color: '#A32A25', marginTop: 10, marginBottom: 0 },
};
