'use client';

import { useState } from 'react';

/**
 * Заказ техники и услуг.
 *
 * Сохранение и отправка разведены намеренно: экспонент собирает заказ
 * в несколько заходов, и «сохранить» не должно означать «отправить».
 * Прототип этого различия не делал — там кнопка была одна.
 */
export default function OrderForm({
  katalog,
  bemerkung: initialBemerkung,
  eingereichtAm,
  bereich = 'technik',
  submitLabel = 'Bestellung übermitteln',
}) {
  const [mengen, setMengen] = useState(
    Object.fromEntries(katalog.map((k) => [k.id, k.menge || 0]))
  );
  const [bemerkung, setBemerkung] = useState(initialBemerkung || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [eingereicht, setEingereicht] = useState(eingereichtAm);

  const positionen = Object.values(mengen).filter((m) => m > 0).length;

  function setMenge(id, delta) {
    setMengen((m) => ({ ...m, [id]: Math.max(0, Math.min(999, (m[id] || 0) + delta)) }));
    setMessage(null);
  }

  async function submit(einreichen) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/service', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mengen, bemerkung, einreichen, bereich }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        if (einreichen) setEingereicht(new Date().toISOString());
        setMessage({
          type: 'ok',
          text: einreichen
            ? 'Bestellung übermittelt. Die Konditionen erhalten Sie mit der Auftragsbestätigung.'
            : `Gespeichert um ${new Date().toLocaleTimeString('de-CH')}.`,
        });
      } else {
        setMessage({ type: 'err', text: data.error || 'Speichern fehlgeschlagen.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung. Bitte versuchen Sie es erneut.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {eingereicht && (
        <p style={S.sent} role="status">
          Bestellung übermittelt am {new Date(eingereicht).toLocaleDateString('de-CH')}.
          Änderungen sind weiterhin möglich — bitte erneut übermitteln.
        </p>
      )}

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Position</th>
              <th style={{ ...S.th, width: 110 }}>Preis</th>
              <th style={{ ...S.th, width: 140, textAlign: 'right' }}>Menge</th>
            </tr>
          </thead>
          <tbody>
            {katalog.map((k) => (
              <tr key={k.id}>
                <td style={S.td}>
                  <b>{k.bezeichnung}</b>
                  {k.beschreibung && <div style={S.desc}>{k.beschreibung}</div>}
                </td>
                <td style={S.td}>
                  {/* Цены назначаются с подтверждением заказа — так и в прототипе. */}
                  <span style={S.xx}>XX</span>
                  <div style={S.desc}>pro {k.einheit}</div>
                </td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <div style={S.stepper}>
                    <button
                      type="button"
                      className="tap"
                      onClick={() => setMenge(k.id, -1)}
                      disabled={busy || !mengen[k.id]}
                      aria-label={`${k.bezeichnung}: weniger`}
                      style={S.step}
                    >
                      −
                    </button>
                    <span style={S.menge} aria-live="polite">
                      {mengen[k.id] || 0}
                    </span>
                    <button
                      type="button"
                      className="tap"
                      onClick={() => setMenge(k.id, 1)}
                      disabled={busy}
                      aria-label={`${k.bezeichnung}: mehr`}
                      style={S.step}
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <label htmlFor="bemerkung" style={S.label}>
          Bemerkung
        </label>
        <textarea
          id="bemerkung"
          rows={3}
          value={bemerkung}
          onChange={(e) => {
            setBemerkung(e.target.value);
            setMessage(null);
          }}
          placeholder="Besonderheiten, Platzierung, Zeitfenster …"
          style={S.textarea}
        />

        <div style={S.actions}>
          <span style={S.count}>
            {positionen === 0 ? 'Noch nichts ausgewählt' : `${positionen} Positionen gewählt`}
          </span>
          <button type="button" onClick={() => submit(false)} disabled={busy} style={S.secondary}>
            Speichern
          </button>
          <button type="button" onClick={() => submit(true)} disabled={busy || positionen === 0} style={S.primary}>
            {busy ? 'Einen Moment…' : submitLabel}
          </button>
        </div>

        {message && (
          <p role="status" style={message.type === 'err' ? S.err : S.ok}>
            {message.text}
          </p>
        )}
      </div>
    </>
  );
}

const S = {
  card: { background: '#fff', border: '1px solid var(--line)', borderRadius: 3, padding: '18px 20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 18 },
  th: { textAlign: 'left', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', padding: '0 0 8px', borderBottom: '1px solid var(--line)' },
  td: { padding: '10px 0', borderBottom: '1px solid var(--line)', verticalAlign: 'top', fontSize: 14 },
  desc: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  xx: { color: '#A32A25', fontWeight: 700 },
  stepper: { display: 'inline-flex', alignItems: 'center', gap: 4 },
  step: { width: 40, justifyContent: 'center', border: '1px solid var(--line)', background: '#fff', borderRadius: 3, cursor: 'pointer', fontSize: 16 },
  menge: { minWidth: 32, textAlign: 'center', fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  label: { fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 4 },
  textarea: { width: '100%', padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 3, resize: 'vertical' },
  actions: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' },
  count: { fontSize: 13, color: 'var(--muted)', marginRight: 'auto' },
  secondary: { padding: '10px 16px', border: '1px solid var(--line)', background: '#fff', borderRadius: 3, cursor: 'pointer', minHeight: 44 },
  primary: { padding: '10px 18px', border: 0, background: 'var(--blue)', color: '#fff', fontWeight: 600, borderRadius: 3, cursor: 'pointer', minHeight: 44 },
  ok: { fontSize: 13, color: '#1B7A5A', marginTop: 12 },
  err: { fontSize: 13, color: '#A32A25', marginTop: 12 },
  sent: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px', marginBottom: 16 },
};
