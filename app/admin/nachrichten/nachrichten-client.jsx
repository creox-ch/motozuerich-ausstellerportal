'use client';

import { useState } from 'react';

/**
 * Разговоры по компаниям. Неотвеченные сверху — порядок задаёт сервер.
 *
 * Ответ пишется прямо в разговоре, без перехода на отдельный экран: типичное
 * действие здесь — прочитать вопрос и ответить на него, и разносить это
 * по двум экранам значит заставлять держать вопрос в голове.
 */
export default function AdminNachrichtenClient({ threads }) {
  const [message, setMessage] = useState(null);

  if (threads.length === 0) {
    return <p style={S.muted}>Noch keine Nachrichten von Ausstellern.</p>;
  }

  return (
    <>
      {message && (
        <p role="status" style={message.type === 'err' ? S.err : S.ok}>
          {message.text}
        </p>
      )}
      {threads.map((t) => (
        <Thread key={t.companyId} thread={t} onResult={setMessage} />
      ))}
    </>
  );
}

function Thread({ thread, onResult }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [gesendet, setGesendet] = useState([]);

  async function antworten(event) {
    event.preventDefault();
    if (!text.trim()) return;

    setBusy(true);
    onResult(null);
    try {
      const res = await fetch('/api/admin/nachrichten', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ company_id: thread.companyId, text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && data.nachricht) {
        setGesendet((alt) => [...alt, data.nachricht]);
        setText('');
        onResult({
          type: 'ok',
          text:
            data.empfaenger > 0
              ? 'Gesendet und per E-Mail benachrichtigt.'
              : 'Gesendet. Achtung: für diese Firma ist kein aktiver Zugang eingetragen, es ging keine E-Mail raus.',
        });
      } else {
        onResult({ type: 'err', text: data.error || 'Fehlgeschlagen.' });
      }
    } catch {
      onResult({ type: 'err', text: 'Keine Verbindung.' });
    } finally {
      setBusy(false);
    }
  }

  const alle = [...thread.nachrichten, ...gesendet];

  return (
    <section style={S.card}>
      <h2 style={S.h2}>
        {thread.firma || 'Unbekannte Firma'}
        {thread.offen && gesendet.length === 0 && <span style={S.badge}>wartet</span>}
      </h2>

      <ul style={S.list}>
        {alle.map((n) => (
          <li key={n.id} style={{ ...S.item, ...(n.von === 'messeleitung' ? S.uns : S.ihr) }}>
            <div style={S.meta}>
              {n.von === 'messeleitung' ? `Messeleitung · ${n.autor_email}` : n.autor_email}
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
        ))}
      </ul>

      <form onSubmit={antworten}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          style={S.textarea}
          aria-label={`Antwort an ${thread.firma || 'Firma'}`}
          placeholder="Antwort"
        />
        <button type="submit" disabled={busy || !text.trim()} style={S.btn}>
          Antworten
        </button>
      </form>
    </section>
  );
}

const S = {
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '16px 18px',
    marginBottom: 16,
    maxWidth: 760,
  },
  h2: { fontSize: 15, margin: '0 0 12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 },
  badge: { fontSize: 11, fontWeight: 700, background: '#FBF1D2', borderRadius: 2, padding: '3px 8px' },
  list: { listStyle: 'none', margin: '0 0 12px', padding: 0, display: 'grid', gap: 8 },
  item: { border: '1px solid var(--line)', borderRadius: 3, padding: '10px 12px' },
  uns: { borderLeft: '3px solid var(--signal)' },
  ihr: { borderLeft: '3px solid #B9C7DB', background: '#F8FAFD' },
  meta: { fontSize: 12, color: 'var(--muted)', marginBottom: 4 },
  text: { fontSize: 14, whiteSpace: 'pre-wrap' },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  btn: {
    marginTop: 10,
    padding: '10px 18px',
    border: 0,
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 3,
    cursor: 'pointer',
    minHeight: 44,
  },
  muted: { fontSize: 13, color: 'var(--muted)' },
  ok: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px' },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px' },
};
