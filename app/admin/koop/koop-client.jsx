'use client';

import { useState } from 'react';

const STATUS_TEXT = {
  eingereicht: 'in Prüfung',
  bestaetigt: 'bestätigt',
  abgelehnt: 'abgelehnt',
};

/** Проверка подтверждений: подтвердить, отклонить, вернуть. */
export default function AdminKoopClient({ nachweise }) {
  const [liste, setListe] = useState(nachweise);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  async function setStatus(id, status) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/koop', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setListe((alt) =>
          alt.map((n) =>
            n.id === id ? { ...n, status: data.nachweis.status, punkte: data.nachweis.punkte } : n
          )
        );
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
    return <p style={S.muted}>Noch keine Nachweise eingereicht.</p>;
  }

  return (
    <>
      {message && (
        <p role="status" style={S.err}>
          {message.text}
        </p>
      )}
      {liste.map((n) => (
        <section key={n.id} style={S.card}>
          <h2 style={S.h2}>
            {n.mz_koop_massnahmen?.titel || n.massnahme_id}
            <span style={S.punkte}>{n.punkte ?? n.mz_koop_massnahmen?.punkte ?? 0} Punkte</span>
            <span style={S.badge}>{STATUS_TEXT[n.status] || n.status}</span>
          </h2>
          <div style={S.meta}>
            {n.mz_companies?.name || 'Unbekannte Firma'} · {n.mz_koop_massnahmen?.gruppe || '—'}
            {n.umgesetzt_am ? ` · umgesetzt ${n.umgesetzt_am}` : ''}
          </div>

          {n.link && (
            <p style={S.zeile}>
              {/* Ссылка ведёт на чужой сайт: noopener, чтобы открытая страница
                  не получила доступ к нашей вкладке. */}
              <a href={n.link} target="_blank" rel="noopener noreferrer nofollow" style={S.link}>
                {n.link}
              </a>
            </p>
          )}
          {n.datei_pfad && <p style={S.zeile}>Beleg hochgeladen: {n.datei_pfad.split('/').pop()}</p>}
          {n.bemerkung && <p style={S.zeile}>{n.bemerkung}</p>}

          <div style={S.aktionen}>
            {n.status !== 'bestaetigt' && (
              <button type="button" disabled={busy} onClick={() => setStatus(n.id, 'bestaetigt')} style={S.btn}>
                Bestätigen
              </button>
            )}
            {n.status !== 'abgelehnt' && (
              <button type="button" disabled={busy} onClick={() => setStatus(n.id, 'abgelehnt')} style={S.btn}>
                Ablehnen
              </button>
            )}
            {n.status !== 'eingereicht' && (
              <button type="button" disabled={busy} onClick={() => setStatus(n.id, 'eingereicht')} style={S.btn}>
                Zurück in Prüfung
              </button>
            )}
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
  punkte: { fontSize: 13, color: 'var(--muted)', fontWeight: 600 },
  badge: { fontSize: 11, padding: '3px 8px', borderRadius: 2, fontWeight: 700, background: '#F1F4F9' },
  meta: { fontSize: 12, color: 'var(--muted)' },
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
