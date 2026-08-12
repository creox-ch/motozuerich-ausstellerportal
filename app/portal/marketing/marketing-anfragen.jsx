'use client';

import { useState } from 'react';
import {
  AENDERUNG_TYPEN,
  ART_TITEL,
  KATALOG_PAKETE,
  MAX_TEXT,
} from '../../../lib/marketing';
import NochNicht from '../noch-nicht';

const STATUS_TEXT = {
  neu: 'eingegangen',
  in_bearbeitung: 'in Bearbeitung',
  erledigt: 'erledigt',
  abgelehnt: 'abgelehnt',
};

/**
 * Четыре блока прототипа одной механикой: экспонент просит — Messeleitung
 * отвечает вручную.
 *
 * Раскрывающиеся блоки, а не четыре формы подряд: одновременно человеку нужен
 * ровно один из них, а развёрнутые сразу все превращают страницу в анкету.
 */
export default function MarketingAnfragen({ anfragen }) {
  const [liste, setListe] = useState(anfragen);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function senden(art, felder, datei) {
    const form = new FormData();
    form.set('art', art);
    for (const [k, v] of Object.entries(felder)) form.set(k, v ?? '');
    if (datei) form.set('file', datei);

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/marketing-anfrage', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && data.anfrage) {
        setListe((alt) => [data.anfrage, ...alt]);
        setMessage({ type: 'ok', text: 'Anfrage ist bei der Messeleitung. Wir melden uns.' });
        return true;
      }
      setMessage({ type: 'err', text: data.error || 'Fehlgeschlagen.' });
      return false;
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung.' });
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <NochNicht was="Dieser Teil des Bereichs" variante="in-arbeit">
        Preise, Fristen und Pakete sind noch nicht festgelegt — überall dort steht XX.
      </NochNicht>

      {message && (
        <p role="status" style={message.type === 'err' ? S.err : S.ok}>
          {message.text}
        </p>
      )}

      <Katalog onSend={senden} busy={busy} />
      <LedWall onSend={senden} busy={busy} />
      <Design onSend={senden} busy={busy} />
      <Aenderung onSend={senden} busy={busy} />

      <section style={S.card}>
        <h3 style={S.h3}>
          Ihre Anfragen <span style={S.klein}>{liste.length}</span>
        </h3>
        {liste.length === 0 ? (
          <p style={S.klein}>Noch keine Anfragen.</p>
        ) : (
          <ul style={S.list}>
            {liste.map((a) => (
              <li key={a.id} style={S.zeile}>
                <span style={S.text}>
                  {ART_TITEL[a.art] || a.art}
                  {a.auswahl ? ` · ${a.auswahl}` : ''}
                </span>
                <span style={S.status}>{STATUS_TEXT[a.status] || a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Block({ titel, hinweis, children }) {
  return (
    <details style={S.details}>
      <summary style={S.summary}>
        {titel}
        {hinweis && <em style={S.summaryHint}>{hinweis}</em>}
      </summary>
      <div style={S.body}>{children}</div>
    </details>
  );
}

function Katalog({ onSend, busy }) {
  const [paket, setPaket] = useState('plus');

  return (
    <Block titel="Online-Präsenz im digitalen Katalog" hinweis="ganzjährig sichtbar">
      <p style={S.klein}>
        Der digitale Katalog läuft das ganze Jahr, ist jederzeit änderbar, verlinkt direkt in
        Ihren Shop und liefert Zahlen zur Wirkung.
      </p>
      <ul style={S.pakete}>
        {KATALOG_PAKETE.map((p) => (
          <li key={p.id} style={S.paket}>
            <label style={S.paketLabel}>
              {p.inbegriffen ? (
                <span style={S.inbegriffen}>enthalten</span>
              ) : (
                <input
                  type="radio"
                  name="paket"
                  value={p.id}
                  checked={paket === p.id}
                  onChange={() => setPaket(p.id)}
                />
              )}
              <span>
                <b>{p.titel}</b>
                <span style={S.klein}> — {p.beschreibung}</span>
              </span>
            </label>
            <span style={S.preis}>{p.inbegriffen ? '—' : <span style={S.xx}>XX</span>}</span>
          </li>
        ))}
      </ul>
      <button type="button" disabled={busy} onClick={() => onSend('online_katalog', { auswahl: paket })} style={S.btn}>
        Paket anfragen
      </button>
    </Block>
  );
}

function LedWall({ onSend, busy }) {
  return (
    <Block titel="LED-Wall in der Live Arena, 13 Meter" hinweis={<>Frist <span style={S.xx}>XX.XX.2027</span></>}>
      <p style={S.klein}>
        15-Sekunden-Spots ohne Ton zwischen den Programmpunkten, über alle drei Messetage.
      </p>
      <dl style={{ margin: '10px 0 0' }}>
        <Kv label="Ausspielungen" wert="mindestens 100 pro Kunde" />
        <Kv label="Spotlänge" wert="15 Sekunden, ohne Ton" />
        <Kv label="Video" wert="16:9, Full HD 1920 × 1080" />
        <Kv label="Folien" wert="PowerPoint 16:9" />
        <Kv label="Preis" wert={<span style={S.xx}>XX</span>} />
      </dl>
      <button type="button" disabled={busy} onClick={() => onSend('led_wall', {})} style={S.btn}>
        LED-Wall anfragen
      </button>
    </Block>
  );
}

function Design({ onSend, busy }) {
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [datei, setDatei] = useState(null);

  return (
    <Block titel="Design im MOTO-ZÜRICH-Look" hinweis="auf Anfrage">
      <p style={S.klein}>
        Gefällt Ihnen ein bestehendes Visual, passen wir es für Ihre Marke an oder gestalten
        neu im gleichen Stil.
      </p>
      <label style={S.label}>
        Was bräuchten Sie?
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_TEXT}
          rows={3}
          placeholder="z. B. Ankündigungs-Reel mit unserer Neuheit, 9:16"
          style={{ ...S.input, width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
        />
        <span style={S.zaehler}>
          {text.length} von {MAX_TEXT} Zeichen
        </span>
      </label>
      <div style={S.row}>
        <label style={S.label}>
          Originaldateien
          <input type="file" onChange={(e) => setDatei(e.target.files?.[0] || null)} style={S.input} />
        </label>
        <label style={{ ...S.label, flex: '1 1 220px' }}>
          oder Link zu den Dateien
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Drive, WeTransfer, Dropbox"
            style={S.input}
          />
        </label>
      </div>
      <button
        type="button"
        disabled={busy || !text.trim()}
        onClick={async () => {
          if (await onSend('design', { text, link }, datei)) {
            setText('');
            setLink('');
            setDatei(null);
          }
        }}
        style={S.btn}
      >
        Anfrage senden
      </button>
    </Block>
  );
}

function Aenderung({ onSend, busy }) {
  const [typ, setTyp] = useState(AENDERUNG_TYPEN[0]);
  const [text, setText] = useState('');
  const [datei, setDatei] = useState(null);

  return (
    <Block
      titel="Änderung auf Website oder im Katalog melden"
      hinweis={<>innert <span style={S.xx}>XX</span> Arbeitstagen</>}
    >
      <div style={S.row}>
        <label style={S.label}>
          Was soll geändert werden?
          <select value={typ} onChange={(e) => setTyp(e.target.value)} style={S.input}>
            {AENDERUNG_TYPEN.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label style={S.label}>
          Datei anhängen
          <input type="file" onChange={(e) => setDatei(e.target.files?.[0] || null)} style={S.input} />
        </label>
      </div>
      <label style={S.label}>
        Beschreibung der Änderung
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_TEXT}
          rows={3}
          style={{ ...S.input, width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
        />
      </label>
      <button
        type="button"
        disabled={busy || !text.trim()}
        onClick={async () => {
          if (await onSend('aenderung', { auswahl: typ, text }, datei)) {
            setText('');
            setDatei(null);
          }
        }}
        style={S.btn}
      >
        Änderung senden
      </button>
    </Block>
  );
}

function Kv({ label, wert }) {
  return (
    <div style={S.kv}>
      <dt style={S.dt}>{label}</dt>
      <dd style={S.dd}>{wert}</dd>
    </div>
  );
}

const S = {
  details: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    marginBottom: 10,
    maxWidth: 760,
  },
  summary: { padding: '13px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14, minHeight: 44 },
  summaryHint: { color: 'var(--muted)', fontWeight: 400, fontStyle: 'normal', marginLeft: 8, fontSize: 13 },
  body: { padding: '0 16px 16px' },
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '16px 18px',
    marginTop: 14,
    maxWidth: 760,
  },
  h3: { fontSize: 14, margin: '0 0 10px', fontWeight: 700 },
  klein: { fontSize: 12, color: 'var(--muted)' },
  pakete: { listStyle: 'none', margin: '12px 0', padding: 0 },
  paket: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '9px 0',
    borderTop: '1px solid var(--line)',
  },
  paketLabel: { display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1, fontSize: 14, cursor: 'pointer' },
  inbegriffen: { fontSize: 11, color: 'var(--muted)', minWidth: 66 },
  preis: { fontWeight: 700 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--muted)', marginBottom: 10 },
  input: {
    padding: '9px 11px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    minHeight: 44,
    fontSize: 14,
    color: 'var(--ink)',
  },
  zaehler: { fontSize: 11, color: 'var(--muted)' },
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
  kv: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 13 },
  dt: { color: 'var(--muted)', margin: 0 },
  dd: { margin: 0, fontWeight: 600 },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  zeile: { display: 'flex', gap: 12, padding: '8px 0', borderTop: '1px solid var(--line)', fontSize: 13 },
  text: { flex: 1 },
  status: { fontWeight: 600, color: 'var(--muted)' },
  xx: { color: '#A32A25', fontWeight: 700 },
  ok: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px', maxWidth: 760 },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px', maxWidth: 760 },
};
