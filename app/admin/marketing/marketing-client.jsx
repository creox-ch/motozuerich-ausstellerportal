'use client';

import { useState } from 'react';
import { ART_TITEL, STATUS } from '../../../lib/marketing';

const STATUS_TEXT = {
  neu: 'neu',
  in_bearbeitung: 'in Bearbeitung',
  erledigt: 'erledigt',
  abgelehnt: 'abgelehnt',
};

/** Ведение статуса заявок по маркетингу. */
export default function AdminMarketingClient({ anfragen }) {
  const [liste, setListe] = useState(anfragen);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  async function setStatus(id, status) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/marketing-anfrage', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setListe((alt) => alt.map((a) => (a.id === id ? { ...a, status: data.status } : a)));
      } else {
        setMessage({ text: data.error || 'Fehlgeschlagen.' });
      }
    } catch {
      setMessage({ text: 'Keine Verbindung.' });
    } finally {
      setBusy(false);
    }
  }

  if (liste.length === 0) {
    return <p style={S.muted}>Noch keine Anfragen.</p>;
  }

  return (
    <>
      {message && (
        <p role="status" style={S.err}>
          {message.text}
        </p>
      )}
      {liste.map((a) => (
        <section key={a.id} style={S.card}>
          <h2 style={S.h2}>
            {ART_TITEL[a.art] || a.art}
            {a.auswahl && <span style={S.auswahl}>{a.auswahl}</span>}
            <span style={S.badge}>{STATUS_TEXT[a.status] || a.status}</span>
          </h2>
          <div style={S.meta}>
            {a.mz_companies?.name || 'Unbekannte Firma'} ·{' '}
            {new Date(a.created_at).toLocaleDateString('de-CH')}
          </div>

          {a.text && <p style={S.text}>{a.text}</p>}
          {a.link && (
            <p style={S.zeile}>
              <a href={a.link} target="_blank" rel="noopener noreferrer nofollow" style={S.link}>
                {a.link}
              </a>
            </p>
          )}
          {a.datei_pfad && <p style={S.zeile}>Datei: {a.datei_pfad.split('/').pop()}</p>}

          <div style={S.aktionen}>
            {STATUS.filter((s) => s !== a.status).map((s) => (
              <button key={s} type="button" disabled={busy} onClick={() => setStatus(a.id, s)} style={S.btn}>
                {STATUS_TEXT[s]}
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

const S = {
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '16px 18px',
    marginBottom: 14,
    maxWidth: 820,
  },
  h2: { fontSize: 15, margin: '0 0 6px', fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  auswahl: { fontSize: 13, color: 'var(--muted)', fontWeight: 600 },
  badge: { fontSize: 11, padding: '3px 8px', borderRadius: 2, fontWeight: 700, background: '#F1F4F9' },
  meta: { fontSize: 12, color: 'var(--muted)' },
  text: { fontSize: 14, margin: '10px 0 0', whiteSpace: 'pre-wrap' },
  zeile: { fontSize: 13, margin: '8px 0 0', wordBreak: 'break-all' },
  link: { color: 'var(--blue)' },
  aktionen: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  btn: {
    padding: '9px 14px',
    border: '1px solid var(--line)',
    background: '#fff',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 13,
    minHeight: 44,
  },
  muted: { fontSize: 13, color: 'var(--muted)' },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px' },
};
