'use client';

import { useRef, useState } from 'react';

/**
 * Загрузка логотипа.
 *
 * Показываем то, что уже лежит, а не только поле выбора: иначе человек не
 * понимает, загрузил он что-нибудь в прошлый раз или нет, и грузит заново.
 */
export default function LogoUpload({ initialUrl }) {
  const [url, setUrl] = useState(initialUrl || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const input = useRef(null);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/profile/logo', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setUrl(data.logoUrl);
      } else {
        setError(data.error || 'Upload fehlgeschlagen.');
      }
    } catch {
      setError('Keine Verbindung. Bitte versuchen Sie es erneut.');
    } finally {
      setBusy(false);
      // Сбрасываем поле: иначе повторный выбор того же файла не вызовет
      // событие, и человек решит, что кнопка сломалась.
      if (input.current) input.current.value = '';
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/logo', { method: 'DELETE' });
      if (res.ok) setUrl(null);
      else setError('Löschen fehlgeschlagen.');
    } catch {
      setError('Keine Verbindung.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={S.wrap}>
      <div style={S.label}>Logo</div>

      {url ? (
        <div style={S.preview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Ihr Logo" style={S.img} />
          <button type="button" onClick={remove} disabled={busy} style={S.remove}>
            Entfernen
          </button>
        </div>
      ) : (
        <p style={S.empty}>Noch kein Logo hochgeladen.</p>
      )}

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={upload}
        disabled={busy}
        aria-label="Logo hochladen"
        style={S.input}
      />
      <p style={S.hint}>PNG, JPEG oder WebP, maximal 2 MB.</p>
      {busy && <p style={S.hint}>Wird hochgeladen…</p>}
      {error && <p style={S.err}>{error}</p>}
    </div>
  );
}

const S = {
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, color: 'var(--muted)', marginBottom: 6 },
  preview: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  img: {
    maxWidth: 140,
    maxHeight: 70,
    objectFit: 'contain',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: 6,
    background: '#fff',
  },
  remove: {
    background: 'none',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '5px 10px',
    fontSize: 13,
    cursor: 'pointer',
  },
  empty: { fontSize: 13, color: 'var(--muted)', margin: '0 0 10px' },
  input: { fontSize: 13 },
  hint: { fontSize: 12, color: 'var(--muted)', margin: '6px 0 0' },
  err: { fontSize: 12, color: '#A32A25', margin: '6px 0 0' },
};
