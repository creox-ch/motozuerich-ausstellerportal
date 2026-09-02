'use client';

import { useState } from 'react';
import { AGB_PUNKTE, AGB_VERSION } from '../../lib/agb';

export default function AgbAkzeptanz({ akzeptiertAm, version }) {
  const [checked, setChecked] = useState([false, false, false, false]);
  const [name, setName] = useState('');
  const [funktion, setFunktion] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [done, setDone] = useState(akzeptiertAm || null);

  if (done) {
    const datum = new Date(done).toLocaleString('de-CH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    return (
      <div style={S.card}>
        <h2 style={S.h2}>Ausstellungsbedingungen</h2>
        <p style={S.ok}>
          Akzeptiert am {datum} · Fassung {version || AGB_VERSION}.
        </p>
        <p style={S.hint}>
          <a href="/agb" className="tap">Ausstellungsbedingungen ansehen →</a>
        </p>
      </div>
    );
  }

  const alleAngeklickt = checked.every(Boolean);

  async function submit() {
    if (!alleAngeklickt || !name.trim() || !funktion.trim()) {
      setMessage({ type: 'err', text: 'Bitte alle vier Punkte anklicken sowie Name und Funktion eintragen.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/agb', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, funktion, punkte: checked }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDone(data.akzeptiertAm);
      } else {
        setMessage({ type: 'err', text: data.error || 'Das hat nicht geklappt. Bitte erneut versuchen.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Verbindung fehlgeschlagen. Bitte erneut versuchen.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={S.card}>
      <h2 style={S.h2}>Ausstellungsbedingungen</h2>
      <p style={S.lead}>
        Bitte lesen Sie die{' '}
        <a href="/agb" target="_blank" rel="noopener" className="tap">
          Ausstellungsbedingungen MOTO-ZÜRICH 2027 (Fassung {AGB_VERSION})
        </a>{' '}
        und bestätigen Sie die folgenden vier Punkte.
      </p>

      <div style={S.punkte}>
        {AGB_PUNKTE.map((text, i) => (
          <label key={i} style={S.punkt}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => {
                const next = [...checked];
                next[i] = e.target.checked;
                setChecked(next);
                setMessage(null);
              }}
              style={S.checkbox}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>

      <div style={S.zwei}>
        <div style={S.feld}>
          <label style={S.label} htmlFor="agbName">Name der handelnden Person</label>
          <input
            id="agbName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={S.input}
            placeholder="Vorname Nachname"
          />
        </div>
        <div style={S.feld}>
          <label style={S.label} htmlFor="agbFunk">Funktion</label>
          <input
            id="agbFunk"
            type="text"
            value={funktion}
            onChange={(e) => setFunktion(e.target.value)}
            style={S.input}
            placeholder="z. B. Geschäftsführung"
          />
        </div>
      </div>

      <p style={S.hint}>
        Mit der Bestätigung geben Sie ein verbindliches Angebot ab. Der Vertrag kommt mit der
        Standbestätigung durch die Creox GmbH zustande. Name, Funktion, Zeitpunkt und die Version
        der akzeptierten Dokumente werden automatisch protokolliert.
      </p>

      {message && (
        <p style={message.type === 'err' ? S.err : S.ok}>{message.text}</p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy || !alleAngeklickt}
        style={{ ...S.btn, ...(busy || !alleAngeklickt ? S.btnDisabled : null) }}
      >
        {busy ? 'Wird übermittelt …' : 'Verbindlich anmelden'}
      </button>
    </div>
  );
}

const S = {
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '18px 20px',
    maxWidth: 620,
    marginTop: 16,
  },
  h2: { fontSize: 15, margin: '0 0 10px', fontWeight: 700 },
  lead: { fontSize: 14, margin: '0 0 16px', color: 'var(--text)' },
  punkte: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 },
  punkt: { display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.4, cursor: 'pointer' },
  checkbox: { marginTop: 3, flex: '0 0 auto' },
  zwei: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  feld: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: 'var(--muted)' },
  input: {
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '8px 10px',
    fontSize: 14,
  },
  hint: { fontSize: 12, color: 'var(--muted)', margin: '0 0 14px', maxWidth: '60ch' },
  err: { fontSize: 13, color: '#A32A25', margin: '0 0 12px' },
  ok: { fontSize: 13.5, color: '#1B7A5A', margin: '0 0 10px', fontWeight: 600 },
  btn: {
    background: 'var(--blue)',
    color: '#fff',
    border: 'none',
    borderRadius: 3,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
};
