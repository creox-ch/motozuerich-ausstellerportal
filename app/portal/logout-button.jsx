'use client';

import { useState } from 'react';

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      // Уходим в любом случае: остаться на странице кабинета после нажатия
      // «Выйти» — худшее из возможных поведений.
      window.location.href = '/';
    }
  }

  return (
    <button type="button" onClick={logout} disabled={busy} style={style}>
      {busy ? 'Abmelden…' : 'Abmelden'}
    </button>
  );
}

const style = {
  background: 'none',
  border: '1px solid rgba(255,255,255,.3)',
  color: '#fff',
  borderRadius: 3,
  padding: '6px 12px',
  fontSize: 13,
  cursor: 'pointer',
};
