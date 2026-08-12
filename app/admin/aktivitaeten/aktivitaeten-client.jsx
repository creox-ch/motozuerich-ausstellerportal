'use client';

import { useState } from 'react';
import { formatTage } from '../../../lib/aktivitaeten';

/** Проверка заявок: принять, отклонить, вернуть в проверку. */
export default function AdminAktivitaetenClient({ aktivitaeten }) {
  const [liste, setListe] = useState(aktivitaeten);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  async function setStatus(id, status) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/aktivitaeten', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setListe((alt) => alt.map((a) => (a.id === id ? { ...a, status: data.status } : a)));
      } else {
        setMessage({ type: 'err', text: data.error || 'Fehlgeschlagen.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung.' });
    } finally {
      setBusy(false);
    }
  }

  if (liste.length === 0) {
    return <p style={S.muted}>Noch keine Aktivitäten eingereicht.</p>;
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
            {a.titel}
            <span style={STATUS_STYLE[a.status] || S.badge}>{STATUS_TEXT[a.status] || a.status}</span>
          </h2>
          <div style={S.meta}>
            {a.mz_companies?.name || 'Unbekannte Firma'} · {a.format} · {formatTage(a.tage)}
            {a.zeiten ? ` · ${a.zeiten}` : ''} · {a.ort}
          </div>
          {a.beschreibung && <p style={S.text}>{a.beschreibung}</p>}
          {a.bedarf && (
            <p style={S.bedarf}>
              <b>Bedarf:</b> {a.bedarf}
            </p>
          )}
          <div style={S.actions}>
            {a.status !== 'angenommen' && (
              <button type="button" disabled={busy} onClick={() => setStatus(a.id, 'angenommen')} style={S.btn}>
                Annehmen
              </button>
            )}
            {a.status !== 'abgelehnt' && (
              <button type="button" disabled={busy} onClick={() => setStatus(a.id, 'abgelehnt')} style={S.btn}>
                Ablehnen
              </button>
            )}
            {a.status !== 'eingereicht' && (
              <button type="button" disabled={busy} onClick={() => setStatus(a.id, 'eingereicht')} style={S.btn}>
                Zurück in Prüfung
              </button>
            )}
          </div>
        </section>
      ))}
    </>
  );
}

const STATUS_TEXT = {
  eingereicht: 'in Prüfung',
  angenommen: 'angenommen',
  abgelehnt: 'abgelehnt',
};

const badge = { fontSize: 11, padding: '3px 8px', borderRadius: 2, fontWeight: 700, marginLeft: 8 };

const STATUS_STYLE = {
  eingereicht: { ...badge, background: '#FBF1D2' },
  angenommen: { ...badge, background: '#DDF0E4' },
  abgelehnt: { ...badge, background: '#F3DEDD', color: '#A32A25' },
};

const S = {
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '16px 18px',
    marginBottom: 14,
    maxWidth: 760,
  },
  h2: { fontSize: 15, margin: '0 0 6px', fontWeight: 700, display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
  badge,
  meta: { fontSize: 12, color: 'var(--muted)' },
  text: { fontSize: 14, margin: '10px 0 0' },
  bedarf: { fontSize: 13, margin: '8px 0 0', color: 'var(--muted)' },
  actions: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
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
