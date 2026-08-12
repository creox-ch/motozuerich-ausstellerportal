'use client';

import { useState } from 'react';
import { ANFRAGE_STATUS, COMPANY_STATUS } from '../../lib/admin';

/**
 * Рабочий экран Messeleitung: заявки, компании, выдача доступов.
 *
 * Главное, ради чего это сделано: компания выбирается из списка, а руками
 * вводится только почта. Раньше доступ выдавался вставкой строки с
 * идентификатором, скопированным глазами, — опечатка в нём пускала человека
 * в кабинет чужой компании, и ничто этого не ловило.
 */
export default function AdminClient({ anfragen, companies, zugaenge }) {
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  async function call(url, method, body) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMessage({ type: 'ok', text: 'Gespeichert. Seite neu laden für den aktuellen Stand.' });
        return data;
      }
      setMessage({ type: 'err', text: data.error || 'Fehlgeschlagen.' });
      return null;
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung.' });
      return null;
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

      <section style={S.card}>
        <h2 style={S.h2}>
          Standanfragen <span style={S.count}>{anfragen.length}</span>
        </h2>
        {anfragen.length === 0 ? (
          <p style={S.muted}>Noch keine Anfragen.</p>
        ) : (
          <table style={S.table}>
            <tbody>
              {anfragen.map((a) => (
                <tr key={a.id}>
                  <td style={S.td}>
                    <b>{a.firma}</b>
                    <div style={S.small}>
                      {a.name} · {a.email}
                      {a.telefon ? ` · ${a.telefon}` : ''}
                    </div>
                    {a.nachricht && <div style={S.small}>{a.nachricht}</div>}
                    <div style={S.small}>
                      {a.stand_id ? `Fläche ${a.stand_id}` : 'ohne Fläche'} ·{' '}
                      {new Date(a.created_at).toLocaleDateString('de-CH')}
                    </div>
                  </td>
                  <td style={{ ...S.td, width: 190 }}>
                    <select
                      defaultValue={a.status}
                      disabled={busy}
                      onChange={(e) =>
                        call('/api/admin/anfragen', 'PATCH', { id: a.id, status: e.target.value })
                      }
                      style={S.input}
                      aria-label={`Status der Anfrage von ${a.firma}`}
                    >
                      {ANFRAGE_STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {!a.company_id && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          call('/api/admin/companies', 'POST', {
                            name: a.firma,
                            kontakt_name: a.name,
                            kontakt_tel: a.telefon,
                            rechnungs_email: a.email,
                            status: 'angemeldet',
                            anfrage_id: a.id,
                          })
                        }
                        style={S.smallBtn}
                      >
                        Firma anlegen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>Neue Firma</h2>
        <NewCompany onCreate={(body) => call('/api/admin/companies', 'POST', body)} busy={busy} />
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>
          Firmen <span style={S.count}>{companies.length}</span>
        </h2>
        {companies.length === 0 ? (
          <p style={S.muted}>Noch keine Firmen.</p>
        ) : (
          <table style={S.table}>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td style={S.td}>
                    <b>{c.name}</b>
                    <div style={S.small}>{c.status}</div>
                    <div style={S.small}>
                      {zugaenge.filter((z) => z.company_id === c.id).length === 0
                        ? 'kein Zugang erteilt'
                        : zugaenge
                            .filter((z) => z.company_id === c.id)
                            .map((z) => `${z.email}${z.aktiv ? '' : ' (gesperrt)'}`)
                            .join(', ')}
                    </div>
                  </td>
                  <td style={{ ...S.td, width: 320 }}>
                    <ZugangForm
                      company={c}
                      busy={busy}
                      onSubmit={(email) =>
                        call('/api/admin/zugang', 'POST', { email, company_id: c.id })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>Zugänge</h2>
        {zugaenge.length === 0 ? (
          <p style={S.muted}>Noch keine Zugänge.</p>
        ) : (
          <table style={S.table}>
            <tbody>
              {zugaenge.map((z) => (
                <tr key={z.email}>
                  <td style={S.td}>
                    <b>{z.email}</b>
                    <div style={S.small}>
                      {companies.find((c) => c.id === z.company_id)?.name || 'unbekannte Firma'}
                      {z.aktiv ? '' : ' · gesperrt'}
                    </div>
                  </td>
                  <td style={{ ...S.td, width: 140, textAlign: 'right' }}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        call('/api/admin/zugang', 'PATCH', { email: z.email, aktiv: !z.aktiv })
                      }
                      style={S.smallBtn}
                    >
                      {z.aktiv ? 'Sperren' : 'Freigeben'}
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

function NewCompany({ onCreate, busy }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('interessent');

  return (
    <div style={S.row}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Firmenname"
        aria-label="Firmenname"
        style={{ ...S.input, flex: '1 1 220px' }}
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Status"
        style={S.input}
      >
        {COMPANY_STATUS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={busy || !name.trim()}
        onClick={() => {
          onCreate({ name, status });
          setName('');
        }}
        style={S.btn}
      >
        Anlegen
      </button>
    </div>
  );
}

function ZugangForm({ company, busy, onSubmit }) {
  const [email, setEmail] = useState('');

  return (
    <div style={S.row}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@firma.ch"
        aria-label={`Zugang für ${company.name}`}
        style={{ ...S.input, flex: '1 1 160px' }}
      />
      <button
        type="button"
        disabled={busy || !email.trim()}
        onClick={() => {
          onSubmit(email);
          setEmail('');
        }}
        style={S.btn}
      >
        Zugang
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
    marginBottom: 16,
  },
  h2: { fontSize: 15, margin: '0 0 12px', fontWeight: 700 },
  count: { color: 'var(--muted)', fontWeight: 400 },
  table: { width: '100%', borderCollapse: 'collapse' },
  td: { padding: '10px 0', borderBottom: '1px solid var(--line)', verticalAlign: 'top', fontSize: 14 },
  small: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  muted: { fontSize: 13, color: 'var(--muted)', margin: 0 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  input: { padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 3, minHeight: 44 },
  btn: {
    padding: '10px 16px',
    border: 0,
    background: 'var(--blue)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: 3,
    cursor: 'pointer',
    minHeight: 44,
  },
  smallBtn: {
    marginTop: 6,
    padding: '8px 12px',
    border: '1px solid var(--line)',
    background: '#fff',
    borderRadius: 3,
    cursor: 'pointer',
    fontSize: 13,
    minHeight: 44,
  },
  ok: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px' },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px' },
};
