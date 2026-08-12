'use client';

import { useState } from 'react';

/**
 * Назначение окон.
 *
 * Поле свободное, а не выбор из сетки: сетки окон ещё не существует, и
 * выпадающий список из выдуманных интервалов выглядел бы как настоящее
 * расписание. Как только квоты появятся, поле заменится выбором.
 */
export default function AdminLogistikClient({ anmeldungen }) {
  const [message, setMessage] = useState(null);

  if (anmeldungen.length === 0) {
    return <p style={S.muted}>Noch keine Anmeldungen.</p>;
  }

  return (
    <>
      {message && (
        <p role="status" style={message.type === 'err' ? S.err : S.ok}>
          {message.text}
        </p>
      )}
      {anmeldungen.map((a) => (
        <Anmeldung key={a.company_id} anmeldung={a} onResult={setMessage} />
      ))}
    </>
  );
}

function Anmeldung({ anmeldung, onResult }) {
  const [an, setAn] = useState(anmeldung.an_fenster || '');
  const [ab, setAb] = useState(anmeldung.ab_fenster || '');
  const [busy, setBusy] = useState(false);

  async function speichern(event) {
    event.preventDefault();
    setBusy(true);
    onResult(null);
    try {
      const res = await fetch('/api/admin/logistik', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ company_id: anmeldung.company_id, an_fenster: an, ab_fenster: ab }),
      });
      const data = await res.json().catch(() => ({}));
      onResult(
        res.ok && data.ok
          ? { type: 'ok', text: 'Zugeteilt. Der Aussteller sieht es sofort.' }
          : { type: 'err', text: data.error || 'Fehlgeschlagen.' }
      );
    } catch {
      onResult({ type: 'err', text: 'Keine Verbindung.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={S.card}>
      <h2 style={S.h2}>{anmeldung.mz_companies?.name || 'Unbekannte Firma'}</h2>

      <div style={S.spalten}>
        <div>
          <div style={S.klein}>Anlieferung</div>
          <div style={S.wert}>{anmeldung.an_wunsch || '—'}</div>
          <div style={S.klein}>
            {[anmeldung.an_tor, anmeldung.an_fahrzeug, anmeldung.an_kennzeichen, anmeldung.an_telefon]
              .filter(Boolean)
              .join(' · ') || '—'}
          </div>
        </div>
        <div>
          <div style={S.klein}>Abtransport</div>
          <div style={S.wert}>{anmeldung.ab_wunsch || '—'}</div>
          <div style={S.klein}>
            {[anmeldung.ab_tor, anmeldung.ab_fahrzeug].filter(Boolean).join(' · ') || '—'}
          </div>
        </div>
        <div>
          <div style={S.klein}>Parking</div>
          <div style={S.wert}>{anmeldung.parkkarten} Karten</div>
          <div style={S.klein}>{anmeldung.park_notiz || '—'}</div>
        </div>
      </div>

      <form onSubmit={speichern} style={S.row}>
        <label style={S.label}>
          Zeitfenster Anlieferung
          <input
            value={an}
            onChange={(e) => setAn(e.target.value)}
            placeholder="z. B. Mi 17.02., 08:00–09:00"
            style={S.input}
          />
        </label>
        <label style={S.label}>
          Zeitfenster Abtransport
          <input
            value={ab}
            onChange={(e) => setAb(e.target.value)}
            placeholder="z. B. So 21.02., ab 18:30"
            style={S.input}
          />
        </label>
        <button type="submit" disabled={busy} style={S.btn}>
          Zuteilen
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
    marginBottom: 14,
    maxWidth: 900,
  },
  h2: { fontSize: 15, margin: '0 0 12px', fontWeight: 700 },
  spalten: { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 },
  klein: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  wert: { fontSize: 14, fontWeight: 600 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--muted)', flex: '1 1 220px' },
  input: {
    padding: '9px 11px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    minHeight: 44,
    fontSize: 14,
    color: 'var(--ink)',
  },
  btn: {
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
