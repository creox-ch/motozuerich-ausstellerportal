'use client';

import { useState } from 'react';
import AnfrageForm from './anfrage-form';

/**
 * Заявка без выбранной площадки.
 *
 * Нужна потому, что план готов не для всех залов, а покупатель приходит
 * тогда, когда приходит. Отправить его «зайти позже» — значит отдать лид
 * тому, у кого форма есть. Площадь подберёт Messeleitung в разговоре.
 *
 * Форма спрятана за кнопкой намеренно: развёрнутая анкета под планом
 * перетягивает внимание с выбора места, ради которого человек и пришёл.
 */
export default function OffeneAnfrage() {
  const [offen, setOffen] = useState(false);

  if (!offen) {
    return (
      <button type="button" onClick={() => setOffen(true)} style={S.button}>
        Fläche anfragen — ohne feste Auswahl
      </button>
    );
  }

  return <AnfrageForm stand={null} />;
}

const S = {
  button: {
    padding: '11px 18px',
    border: '1px solid var(--ink)',
    borderRadius: 3,
    background: '#fff',
    color: 'var(--ink)',
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 44,
    fontSize: 14,
  },
};
