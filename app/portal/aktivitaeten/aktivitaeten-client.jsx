'use client';

import { useState } from 'react';
import { FORMATE, MAX_BESCHREIBUNG, ORTE, TAGE, formatTage } from '../../../lib/aktivitaeten';

const STATUS_TEXT = {
  eingereicht: 'in Prüfung',
  angenommen: 'angenommen',
  abgelehnt: 'abgelehnt',
};

/**
 * Форма заявки и список уже поданных.
 *
 * Отозвать можно только заявку в статусе «в проверке»: принятая уже стоит
 * в программе и в вёрстке Event-Guide, и снимать её молча нельзя. Кнопка
 * у таких просто не показывается — объяснение стоит рядом, чтобы человек
 * не искал её.
 */
export default function AktivitaetenClient({ aktivitaeten }) {
  const [liste, setListe] = useState(aktivitaeten);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const [titel, setTitel] = useState('');
  const [format, setFormat] = useState(FORMATE[0]);
  const [beschreibung, setBeschreibung] = useState('');
  const [tage, setTage] = useState(['fr', 'sa']);
  const [zeiten, setZeiten] = useState('');
  const [ort, setOrt] = useState(ORTE[0]);
  const [bedarf, setBedarf] = useState('');

  function toggleTag(id) {
    setTage((alt) => (alt.includes(id) ? alt.filter((t) => t !== id) : [...alt, id]));
  }

  async function einreichen(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/aktivitaeten', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ titel, format, beschreibung, tage, zeiten, ort, bedarf }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && data.aktivitaet) {
        setListe((alt) => [data.aktivitaet, ...alt]);
        setTitel('');
        setBeschreibung('');
        setZeiten('');
        setBedarf('');
        setMessage({ type: 'ok', text: 'Eingereicht. Die Messeleitung meldet sich.' });
      } else {
        setMessage({ type: 'err', text: data.error || 'Fehlgeschlagen.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung.' });
    } finally {
      setBusy(false);
    }
  }

  async function zurueckziehen(id) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/aktivitaeten', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setListe((alt) => alt.filter((a) => a.id !== id));
      } else {
        setMessage({ type: 'err', text: data.error || 'Fehlgeschlagen.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="split">
      <form onSubmit={einreichen} style={S.card}>
        <h2 style={S.h2}>Aktivität einreichen</h2>

        {message && (
          <p role="status" style={message.type === 'err' ? S.err : S.ok}>
            {message.text}
          </p>
        )}

        <div style={S.row}>
          <label style={{ ...S.label, flex: '1 1 220px' }}>
            Titel
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z. B. Probefahrt Reiseenduro"
              style={S.input}
              required
            />
          </label>
          <label style={S.label}>
            Format
            <select value={format} onChange={(e) => setFormat(e.target.value)} style={S.input}>
              {FORMATE.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>

        <label style={{ ...S.label, display: 'block', marginBottom: 12 }}>
          Kurzbeschreibung für den Event-Guide
          <textarea
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
            maxLength={MAX_BESCHREIBUNG}
            rows={3}
            style={{ ...S.input, width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
          />
          <span style={S.counter}>
            {beschreibung.length} von {MAX_BESCHREIBUNG} Zeichen
          </span>
        </label>

        <fieldset style={S.fieldset}>
          <legend style={S.legend}>Tage</legend>
          <div style={S.chips}>
            {TAGE.map((t) => (
              <label key={t.id} style={S.chip}>
                <input
                  type="checkbox"
                  checked={tage.includes(t.id)}
                  onChange={() => toggleTag(t.id)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div style={S.row}>
          <label style={{ ...S.label, flex: '1 1 180px' }}>
            Zeiten
            <input
              value={zeiten}
              onChange={(e) => setZeiten(e.target.value)}
              placeholder="z. B. stündlich 10–17 Uhr"
              style={S.input}
            />
          </label>
          <label style={S.label}>
            Ort
            <select value={ort} onChange={(e) => setOrt(e.target.value)} style={S.input}>
              {ORTE.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        </div>

        <label style={{ ...S.label, display: 'block', marginBottom: 14 }}>
          Bedarf an uns
          <input
            value={bedarf}
            onChange={(e) => setBedarf(e.target.value)}
            placeholder="z. B. Strom, Ton, Absperrung"
            style={{ ...S.input, width: '100%' }}
          />
        </label>

        <button type="submit" disabled={busy || !titel.trim() || tage.length === 0} style={S.btn}>
          Aktivität einreichen
        </button>
      </form>

      <aside style={S.card}>
        <h2 style={S.h2}>
          Eingereicht <span style={S.count}>{liste.length}</span>
        </h2>
        {liste.length === 0 ? (
          <p style={S.muted}>Noch nichts eingereicht.</p>
        ) : (
          <ul style={S.list}>
            {liste.map((a) => (
              <li key={a.id} style={S.item}>
                <div style={S.titel}>{a.titel}</div>
                <div style={S.meta}>
                  {a.format} · {formatTage(a.tage)} ·{' '}
                  <span style={a.status === 'abgelehnt' ? S.abgelehnt : S.status}>
                    {STATUS_TEXT[a.status] || a.status}
                  </span>
                </div>
                {a.status === 'eingereicht' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => zurueckziehen(a.id)}
                    style={S.linkBtn}
                  >
                    zurückziehen
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <p style={S.hint}>
          Zurückziehen geht, solange die Aktivität in Prüfung ist. Danach steht sie im
          Programm — schreiben Sie uns über Nachrichten.
        </p>
      </aside>
    </div>
  );
}

const S = {
  card: { background: '#fff', border: '1px solid var(--line)', borderRadius: 3, padding: '18px 20px' },
  h2: { fontSize: 15, margin: '0 0 14px', fontWeight: 700 },
  count: { color: 'var(--muted)', fontWeight: 400 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--muted)' },
  input: {
    padding: '9px 11px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    minHeight: 44,
    fontSize: 14,
    color: 'var(--ink)',
  },
  counter: { fontSize: 11, color: 'var(--muted)', marginTop: 3, display: 'block' },
  fieldset: { border: 0, padding: 0, margin: '0 0 12px' },
  legend: { fontSize: 12, color: 'var(--muted)', padding: 0, marginBottom: 6 },
  chips: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  chip: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, minHeight: 44 },
  btn: {
    padding: '11px 20px',
    border: 0,
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 3,
    cursor: 'pointer',
    minHeight: 44,
  },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  item: { padding: '10px 0', borderBottom: '1px solid var(--line)' },
  titel: { fontWeight: 600, fontSize: 14 },
  meta: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  status: { fontWeight: 600 },
  abgelehnt: { fontWeight: 600, color: '#A32A25' },
  linkBtn: {
    marginTop: 6,
    padding: 0,
    border: 0,
    background: 'none',
    color: 'var(--blue)',
    fontSize: 12,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  muted: { fontSize: 13, color: 'var(--muted)', margin: 0 },
  hint: { fontSize: 12, color: 'var(--muted)', marginTop: 12 },
  ok: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px', marginTop: 0 },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px', marginTop: 0 },
};
