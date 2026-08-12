'use client';

import { useState } from 'react';

const STATUS_TEXT = {
  eingereicht: 'in Prüfung',
  bestaetigt: 'bestätigt',
  abgelehnt: 'abgelehnt',
};

/**
 * Каталог мер и форма подтверждения.
 *
 * Нажатие на меру не «выбирает» её, а открывает форму подтверждения: выбор
 * сам по себе ничего не значит, скидку даёт выполненная работа. Мера, по
 * которой подтверждение уже лежит, помечена и не открывается — правило
 * «одна мера, одно подтверждение» проверяет и сервер.
 */
export default function KoopClient({ gruppen, katalog, nachweise }) {
  const [liste, setListe] = useState(nachweise);
  const [aktiv, setAktiv] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const [link, setLink] = useState('');
  const [datum, setDatum] = useState('');
  const [bemerkung, setBemerkung] = useState('');
  const [datei, setDatei] = useState(null);

  const belegt = new Set(liste.filter((n) => n.status !== 'abgelehnt').map((n) => n.massnahme_id));
  const titelVon = new Map(katalog.map((m) => [m.id, m.titel]));

  function oeffnen(massnahme) {
    setAktiv(massnahme);
    setMessage(null);
    setLink('');
    setDatum('');
    setBemerkung('');
    setDatei(null);
  }

  async function senden(event) {
    event.preventDefault();
    if (!aktiv) return;

    const form = new FormData();
    form.set('massnahme_id', aktiv.id);
    form.set('link', link);
    form.set('umgesetzt_am', datum);
    form.set('bemerkung', bemerkung);
    if (datei) form.set('file', datei);

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/koop', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && data.nachweis) {
        setListe((alt) => [data.nachweis, ...alt]);
        setAktiv(null);
        setMessage({ type: 'ok', text: 'Nachweis eingereicht. Nach der Prüfung werden die Punkte gutgeschrieben.' });
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
    <>
      {message && (
        <p role="status" style={message.type === 'err' ? S.err : S.ok}>
          {message.text}
        </p>
      )}

      {aktiv && (
        <form onSubmit={senden} style={S.formCard}>
          <h2 style={S.h2}>Nachweis: {aktiv.titel}</h2>
          <p style={S.klein}>{aktiv.beschreibung}</p>

          <div style={S.row}>
            <label style={S.label}>
              Datum der Umsetzung
              <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} style={S.input} />
            </label>
            <label style={{ ...S.label, flex: '1 1 240px' }}>
              Link zum Beitrag
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://"
                style={S.input}
              />
            </label>
          </div>

          <div style={S.row}>
            <label style={{ ...S.label, flex: '1 1 260px' }}>
              oder Screenshot, Foto, Beleg
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(e) => setDatei(e.target.files?.[0] || null)}
                style={S.input}
              />
            </label>
          </div>

          <label style={{ ...S.label, display: 'block', marginBottom: 12 }}>
            Bemerkung
            <textarea
              value={bemerkung}
              onChange={(e) => setBemerkung(e.target.value)}
              rows={2}
              placeholder="Reichweite, Auflage, Anzahl Flyer …"
              style={{ ...S.input, width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </label>

          <div style={S.aktionen}>
            <button type="submit" disabled={busy} style={S.btn}>
              Nachweis senden
            </button>
            <button type="button" onClick={() => setAktiv(null)} style={S.ghost}>
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {gruppen.map((gr) => (
        <section key={gr.gruppe} style={S.card}>
          <h2 style={S.h2}>
            {gr.gruppe}{' '}
            <span style={S.modus}>
              {gr.modus === 'einfach' ? 'nur eine Massnahme anrechenbar' : 'Mehrfachauswahl möglich'}
            </span>
          </h2>
          <ul style={S.list}>
            {gr.massnahmen.map((m) => {
              const schonDa = belegt.has(m.id);
              return (
                <li key={m.id} style={S.mass}>
                  <div style={S.massText}>
                    <b>{m.titel}</b>
                    <div style={S.klein}>{m.beschreibung}</div>
                  </div>
                  <div style={S.punkte}>{m.punkte}</div>
                  <button
                    type="button"
                    disabled={schonDa || busy}
                    onClick={() => oeffnen(m)}
                    style={schonDa ? S.ghostAus : S.ghost}
                  >
                    {schonDa ? 'eingereicht' : 'Nachweis'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section style={S.card}>
        <h2 style={S.h2}>
          Ihre Nachweise <span style={S.modus}>{liste.length}</span>
        </h2>
        {liste.length === 0 ? (
          <p style={S.klein}>Noch keine Nachweise eingereicht.</p>
        ) : (
          <ul style={S.list}>
            {liste.map((n) => (
              <li key={n.id} style={S.nachweis}>
                <span style={S.massText}>{titelVon.get(n.massnahme_id) || n.massnahme_id}</span>
                <span style={S.punkte}>{n.punkte ?? '—'}</span>
                <span style={n.status === 'abgelehnt' ? S.abgelehnt : S.status}>
                  {STATUS_TEXT[n.status] || n.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
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
    maxWidth: 760,
  },
  formCard: {
    background: '#fff',
    border: '1px solid var(--ink)',
    borderRadius: 3,
    padding: '16px 18px',
    marginBottom: 16,
    maxWidth: 760,
  },
  h2: { fontSize: 15, margin: '0 0 10px', fontWeight: 700 },
  modus: { fontSize: 12, color: 'var(--muted)', fontWeight: 400 },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  mass: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderTop: '1px solid var(--line)',
    flexWrap: 'wrap',
  },
  nachweis: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '9px 0',
    borderTop: '1px solid var(--line)',
    fontSize: 14,
  },
  massText: { flex: '1 1 220px', minWidth: 0, fontSize: 14 },
  punkte: { fontWeight: 700, fontSize: 15, minWidth: 34, textAlign: 'right' },
  klein: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
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
  aktionen: { display: 'flex', gap: 10, flexWrap: 'wrap' },
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
  ghost: {
    padding: '9px 14px',
    border: '1px solid var(--line)',
    background: '#fff',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 13,
    minHeight: 44,
  },
  ghostAus: {
    padding: '9px 14px',
    border: '1px solid var(--line)',
    background: '#F1F4F9',
    color: 'var(--muted)',
    borderRadius: 3,
    cursor: 'default',
    fontSize: 13,
    minHeight: 44,
  },
  status: { fontWeight: 600, fontSize: 13 },
  abgelehnt: { fontWeight: 600, fontSize: 13, color: '#A32A25' },
  ok: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px' },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px' },
};
