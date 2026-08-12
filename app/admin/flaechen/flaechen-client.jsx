'use client';

import { useState } from 'react';
import { STAND_STATUS } from '../../../lib/admin';

/**
 * Статусы площадок. Меняются здесь — видны на публичном плане сразу.
 *
 * Компания выбирается из списка, не вводится: это тот же риск, что
 * с выдачей доступов.
 */
export default function FlaechenClient({ stands, companies }) {
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(null);

  async function update(stand, patch) {
    setBusy(stand.id);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/stands', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: stand.id,
          status: patch.status ?? stand.status,
          company_id: patch.company_id !== undefined ? patch.company_id : stand.company_id,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(
        res.ok && data.ok
          ? { type: 'ok', text: `${stand.id} gespeichert. Seite neu laden für den aktuellen Stand.` }
          : { type: 'err', text: `${stand.id}: ${data.error || 'fehlgeschlagen'}` }
      );
    } catch {
      setMessage({ type: 'err', text: 'Keine Verbindung.' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {message && (
        <p role="status" style={message.type === 'err' ? S.err : S.ok}>
          {message.text}
        </p>
      )}

      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Fläche</th>
            <th style={S.th}>Status</th>
            <th style={S.th}>Firma</th>
          </tr>
        </thead>
        <tbody>
          {stands.map((s) => (
            <tr key={s.id}>
              <td style={S.td}>
                <b>{s.id}</b>
                <div style={S.small}>
                  {s.halle} · {s.breite_m} × {s.tiefe_m} m
                </div>
              </td>
              <td style={S.td}>
                <select
                  defaultValue={s.status}
                  disabled={busy === s.id}
                  onChange={(e) => update(s, { status: e.target.value })}
                  aria-label={`Status ${s.id}`}
                  style={S.input}
                >
                  {STAND_STATUS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </td>
              <td style={S.td}>
                <select
                  defaultValue={s.company_id || ''}
                  disabled={busy === s.id}
                  onChange={(e) => update(s, { company_id: e.target.value || null })}
                  aria-label={`Firma für ${s.id}`}
                  style={S.input}
                >
                  <option value="">— keine —</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const S = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  th: {
    textAlign: 'left',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '.08em',
    color: 'var(--muted)',
    padding: '10px 12px',
    borderBottom: '1px solid var(--line)',
  },
  td: { padding: '10px 12px', borderBottom: '1px solid var(--line)', fontSize: 14 },
  small: { fontSize: 12, color: 'var(--muted)' },
  input: { padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 3, minHeight: 44 },
  ok: { fontSize: 13, color: '#1B7A5A', border: '1px solid #1B7A5A', borderRadius: 3, padding: '9px 11px', marginBottom: 14 },
  err: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 3, padding: '9px 11px', marginBottom: 14 },
};
