'use client';

import { useState } from 'react';
import { formatBetrag } from '../../../lib/dokumente';

/**
 * Загрузка документов и счетов Messeleitung.
 *
 * Тип решает всё остальное: у документа нет ни суммы, ни срока, у счёта они
 * есть и компания обязательна. Поэтому поля переключаются вместе с типом,
 * а не стоят все сразу — иначе счёт легко залить «на всех».
 */
export default function DokumenteClient({ dokumente, companies }) {
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const [art, setArt] = useState('dokument');
  const [titel, setTitel] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [betrag, setBetrag] = useState('');
  const [faellig, setFaellig] = useState('');
  const [datei, setDatei] = useState(null);

  async function upload(event) {
    event.preventDefault();
    if (!datei) {
      setMessage({ type: 'err', text: 'Keine Datei ausgewählt.' });
      return;
    }

    const form = new FormData();
    form.set('file', datei);
    form.set('titel', titel);
    form.set('art', art);
    if (companyId) form.set('company_id', companyId);
    if (art === 'rechnung') {
      form.set('betrag', betrag);
      form.set('faellig_am', faellig);
    }

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/dokumente', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMessage({ type: 'ok', text: 'Hochgeladen. Seite neu laden für den aktuellen Stand.' });
        setTitel('');
        setBetrag('');
        setFaellig('');
        setDatei(null);
        event.target.reset();
      } else {
        setMessage({ type: 'err', text: data.error || 'Fehlgeschlagen.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung.' });
    } finally {
      setBusy(false);
    }
  }

  async function call(method, body) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/dokumente', {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(
        res.ok && data.ok
          ? { type: 'ok', text: 'Gespeichert. Seite neu laden für den aktuellen Stand.' }
          : { type: 'err', text: data.error || 'Fehlgeschlagen.' }
      );
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung.' });
    } finally {
      setBusy(false);
    }
  }

  const rechnung = art === 'rechnung';

  return (
    <>
      {message && (
        <p role="status" style={message.type === 'err' ? S.err : S.ok}>
          {message.text}
        </p>
      )}

      <section style={S.card}>
        <h2 style={S.h2}>Neu ablegen</h2>
        <form onSubmit={upload}>
          <div style={S.row}>
            <label style={S.label}>
              Art
              <select value={art} onChange={(e) => setArt(e.target.value)} style={S.input}>
                <option value="dokument">Dokument</option>
                <option value="rechnung">Rechnung</option>
              </select>
            </label>

            <label style={{ ...S.label, flex: '1 1 220px' }}>
              Titel
              <input
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                placeholder={rechnung ? 'Rechnung Technik' : 'Technisches Merkblatt'}
                style={S.input}
                required
              />
            </label>

            <label style={S.label}>
              Firma
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                style={S.input}
                required={rechnung}
              >
                <option value="">{rechnung ? '— bitte wählen —' : 'alle Aussteller'}</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {rechnung && (
            <div style={S.row}>
              <label style={S.label}>
                Betrag CHF
                <input
                  value={betrag}
                  onChange={(e) => setBetrag(e.target.value)}
                  placeholder="1250.00"
                  inputMode="decimal"
                  style={S.input}
                />
              </label>
              <label style={S.label}>
                Fällig am
                <input
                  type="date"
                  value={faellig}
                  onChange={(e) => setFaellig(e.target.value)}
                  style={S.input}
                />
              </label>
            </div>
          )}

          <div style={S.row}>
            <label style={{ ...S.label, flex: '1 1 260px' }}>
              Datei (PDF, max. 20 MB)
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setDatei(e.target.files?.[0] || null)}
                style={S.input}
                required
              />
            </label>
            <button type="submit" disabled={busy} style={S.btn}>
              Ablegen
            </button>
          </div>
        </form>
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>
          Abgelegt <span style={S.count}>{dokumente.length}</span>
        </h2>
        {dokumente.length === 0 ? (
          <p style={S.muted}>Noch nichts abgelegt.</p>
        ) : (
          <table style={S.table}>
            <tbody>
              {dokumente.map((d) => (
                <tr key={d.id}>
                  <td style={S.td}>
                    <b>{d.titel}</b>
                    <div style={S.small}>
                      {d.art === 'rechnung' ? 'Rechnung' : 'Dokument'} ·{' '}
                      {d.company_id ? d.mz_companies?.name || 'Firma' : 'alle Aussteller'}
                      {d.betrag_rappen ? ` · ${formatBetrag(d.betrag_rappen)}` : ''}
                    </div>
                    <div style={S.small}>
                      {d.dateiname} · {new Date(d.created_at).toLocaleDateString('de-CH')}
                      {d.art === 'rechnung' && (d.bezahlt_am ? ' · bezahlt' : ' · offen')}
                    </div>
                  </td>
                  <td style={{ ...S.td, width: 220, textAlign: 'right' }}>
                    {d.art === 'rechnung' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => call('PATCH', { id: d.id, bezahlt: !d.bezahlt_am })}
                        style={S.smallBtn}
                      >
                        {d.bezahlt_am ? 'Als offen markieren' : 'Als bezahlt markieren'}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        // Файл после удаления не восстановить, а строку в списке
                        // легко перепутать соседней — поэтому спрашиваем.
                        if (confirm(`«${d.titel}» wirklich löschen?`)) call('DELETE', { id: d.id });
                      }}
                      style={S.smallBtn}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    padding: '18px 20px',
    marginBottom: 16,
  },
  h2: { fontSize: 15, margin: '0 0 12px', fontWeight: 700 },
  count: { color: 'var(--muted)', fontWeight: 400 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 },
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
    padding: '10px 18px',
    border: 0,
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 3,
    cursor: 'pointer',
    minHeight: 44,
  },
  smallBtn: {
    marginLeft: 6,
    padding: '8px 12px',
    border: '1px solid var(--line)',
    background: '#fff',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 13,
    minHeight: 44,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  td: { padding: '10px 0', borderBottom: '1px solid var(--line)', verticalAlign: 'top', fontSize: 14 },
  small: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  muted: { fontSize: 13, color: 'var(--muted)', margin: 0 },
  ok: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px' },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px' },
};
