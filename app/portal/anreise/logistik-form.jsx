'use client';

import { useState } from 'react';
import {
  ABTRANSPORT_TAGE,
  ANLIEFERUNG_TAGE,
  FAHRZEUGE,
  MAX_PARKKARTEN,
  TORE,
} from '../../../lib/logistik';

/**
 * Заявка на подвоз, вывоз и парковку.
 *
 * Одна форма на всё: разделять подвоз и вывоз на два экрана незачем, машина
 * и контактное лицо обычно те же, а заполняют это один раз.
 */
export default function LogistikForm({ logistik }) {
  const [form, setForm] = useState({
    an_wunsch: logistik?.an_wunsch || '',
    an_tor: logistik?.an_tor || '',
    an_fahrzeug: logistik?.an_fahrzeug || '',
    an_kennzeichen: logistik?.an_kennzeichen || '',
    an_telefon: logistik?.an_telefon || '',
    ab_wunsch: logistik?.ab_wunsch || '',
    ab_tor: logistik?.ab_tor || '',
    ab_fahrzeug: logistik?.ab_fahrzeug || '',
    parkkarten: logistik?.parkkarten ?? 0,
    park_notiz: logistik?.park_notiz || '',
  });
  const [eingereichtAm, setEingereichtAm] = useState(logistik?.eingereicht_am || null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  function set(feld, wert) {
    setForm((alt) => ({ ...alt, [feld]: wert }));
  }

  async function senden(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/logistik', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setEingereichtAm(data.eingereichtAm);
        setMessage({ type: 'ok', text: 'Übermittelt. Die Messeleitung teilt Ihnen das Zeitfenster zu.' });
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
      <form onSubmit={senden}>
        <section style={S.card}>
          <h2 style={S.h2}>Anlieferung und Aufbau</h2>
          <div style={S.row}>
            <Feld label="Wunschtag">
              <select value={form.an_wunsch} onChange={(e) => set('an_wunsch', e.target.value)} style={S.input}>
                <option value="">— keine Angabe —</option>
                {ANLIEFERUNG_TAGE.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Feld>
            <Feld label="Zufahrt">
              <select value={form.an_tor} onChange={(e) => set('an_tor', e.target.value)} style={S.input}>
                <option value="">— keine Angabe —</option>
                {TORE.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Feld>
          </div>
          <div style={S.row}>
            <Feld label="Fahrzeug">
              <select value={form.an_fahrzeug} onChange={(e) => set('an_fahrzeug', e.target.value)} style={S.input}>
                <option value="">— keine Angabe —</option>
                {FAHRZEUGE.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Feld>
            <Feld label="Kennzeichen">
              <input
                value={form.an_kennzeichen}
                onChange={(e) => set('an_kennzeichen', e.target.value)}
                placeholder="z. B. ZH 000 000"
                style={S.input}
              />
            </Feld>
            <Feld label="Handy vor Ort">
              <input
                value={form.an_telefon}
                onChange={(e) => set('an_telefon', e.target.value)}
                placeholder="+41 …"
                style={S.input}
              />
            </Feld>
          </div>
        </section>

        <section style={S.card}>
          <h2 style={S.h2}>Abbau und Abtransport</h2>
          <div style={S.row}>
            <Feld label="Wunschtag">
              <select value={form.ab_wunsch} onChange={(e) => set('ab_wunsch', e.target.value)} style={S.input}>
                <option value="">— keine Angabe —</option>
                {ABTRANSPORT_TAGE.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Feld>
            <Feld label="Ausfahrt">
              <select value={form.ab_tor} onChange={(e) => set('ab_tor', e.target.value)} style={S.input}>
                <option value="">— keine Angabe —</option>
                {TORE.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Feld>
            <Feld label="Fahrzeug">
              <select value={form.ab_fahrzeug} onChange={(e) => set('ab_fahrzeug', e.target.value)} style={S.input}>
                <option value="">— keine Angabe —</option>
                {FAHRZEUGE.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Feld>
          </div>
        </section>

        <section style={S.card}>
          <h2 style={S.h2}>Parkbedarf</h2>
          <div style={S.row}>
            <Feld label="Parkkarten">
              <input
                type="number"
                min={0}
                max={MAX_PARKKARTEN}
                value={form.parkkarten}
                onChange={(e) => set('parkkarten', e.target.value)}
                style={{ ...S.input, width: 100 }}
              />
            </Feld>
            <Feld label="Bemerkung">
              <input
                value={form.park_notiz}
                onChange={(e) => set('park_notiz', e.target.value)}
                placeholder="z. B. Anhänger, Dauerparkierung"
                style={{ ...S.input, minWidth: 240 }}
              />
            </Feld>
          </div>
          <p style={S.hint}>
            Preise und Kontingent für Parkkarten stehen noch nicht fest: <span style={S.xx}>XX</span>.
          </p>
        </section>

        {message && (
          <p role="status" style={message.type === 'err' ? S.err : S.ok}>
            {message.text}
          </p>
        )}

        <button type="submit" disabled={busy} style={S.btn}>
          Bedarf übermitteln
        </button>
      </form>

      <aside style={S.card}>
        <h2 style={S.h2}>Ihre Termine</h2>
        <dl style={{ margin: 0 }}>
          <Zeile label="Anlieferung" wert={logistik?.an_fenster} wunsch={form.an_wunsch} />
          <Zeile label="Zufahrt" wert={form.an_tor} />
          <Zeile label="Abtransport" wert={logistik?.ab_fenster} wunsch={form.ab_wunsch} />
          <Zeile label="Ausfahrt" wert={form.ab_tor} />
        </dl>
        <p style={S.hint}>
          {eingereichtAm
            ? 'Ihr Bedarf ist bei der Messeleitung. Das verbindliche Zeitfenster erscheint hier, sobald es zugeteilt ist.'
            : 'Noch nichts übermittelt.'}
        </p>
        <p style={S.hint}>
          Den Zufahrtsschein stellen wir hier bereit, sobald die Zeitfenster zugeteilt sind.
        </p>
      </aside>
    </div>
  );
}

function Feld({ label, children }) {
  return (
    <label style={S.label}>
      {label}
      {children}
    </label>
  );
}

/** Назначенное окно важнее пожелания: пожелание — это ещё не время. */
function Zeile({ label, wert, wunsch }) {
  return (
    <div style={S.kv}>
      <dt style={S.dt}>{label}</dt>
      <dd style={S.dd}>
        {wert || (wunsch ? <span style={S.wunsch}>Wunsch: {wunsch}</span> : 'noch offen')}
      </dd>
    </div>
  );
}

const S = {
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '16px 18px',
    marginBottom: 14,
  },
  h2: { fontSize: 15, margin: '0 0 12px', fontWeight: 700 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--muted)' },
  input: {
    padding: '9px 11px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    minHeight: 44,
    fontSize: 14,
    color: 'var(--ink)',
  },
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
  kv: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--line)' },
  dt: { color: 'var(--muted)', margin: 0, fontSize: 13 },
  dd: { margin: 0, fontWeight: 600, textAlign: 'right', fontSize: 13 },
  wunsch: { fontWeight: 400, color: 'var(--muted)' },
  hint: { fontSize: 12, color: 'var(--muted)', marginTop: 10, marginBottom: 0 },
  xx: { color: '#A32A25', fontWeight: 700 },
  ok: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px' },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px' },
};
