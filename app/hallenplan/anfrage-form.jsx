'use client';

import { useRef, useState } from 'react';
import { KATEGORIEN, ZONEN } from '../../lib/anfrage';

/**
 * Заявка на площадь с публичной страницы.
 *
 * Три слоя защиты от ботов, как на остальных формах платформы: honeypot,
 * замер времени заполнения и проверка на сервере. Ловушка обязана иметь
 * атрибут name — без него автозаполнение браузера однажды съело живой лид.
 *
 * Обязательных полей ровно четыре: компания, контактное лицо, почта, согласие.
 * Остальное помогает разговору, но не мешает отправить — каждое обязательное
 * поле стоит части лидов, а недостающее мы спросим по телефону.
 *
 * Согласий два, и они разные по смыслу: обработка заявки обязательна,
 * новости — добровольны. Одна галочка на оба означала бы либо нарушение
 * швейцарского UWG, либо невозможность написать этим людям осенью.
 *
 * `stand` может быть null: зал ещё не размечен, а человек уже готов говорить.
 */
export default function AnfrageForm({ stand = null }) {
  const [state, setState] = useState('form'); // form | sent
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const started = useRef(Date.now());

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          stand_id: stand?.id || '',
          firma: fd.get('firma') || '',
          name: fd.get('name') || '',
          email: fd.get('email') || '',
          telefon: fd.get('telefon') || '',
          kategorie: fd.get('kategorie') || '',
          zone: fd.get('zone') || '',
          marken: fd.get('marken') || '',
          nachricht: fd.get('nachricht') || '',
          consent: fd.get('consent') === 'on',
          marketing_consent: fd.get('marketing_consent') === 'on',
          website: fd.get('website') || '',
          elapsed_ms: Date.now() - started.current,
          source_url: window.location.href,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) setState('sent');
      else setError(data.error || 'Etwas ist schiefgelaufen.');
    } catch {
      setError('Keine Verbindung. Bitte versuchen Sie es erneut.');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'sent') {
    return (
      <div style={S.done} role="status">
        <strong>Danke, Ihre Anfrage ist bei uns.</strong>
        <p style={S.doneText}>
          Sie erhalten gleich eine Bestätigung per E-Mail. Die Messeleitung meldet sich
          innert zwei Arbeitstagen. Die Anfrage ist unverbindlich — Offerte und Vertrag
          folgen separat.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={S.form}>
      <p style={S.intro}>
        {stand ? `Anfrage für Stand ${stand.id}` : 'Anfrage ohne feste Fläche'}
      </p>

      <Field name="firma" label="Firma" required autoComplete="organization" />
      <Field name="name" label="Ansprechperson" required autoComplete="name" />
      <Field name="email" label="E-Mail" type="email" required autoComplete="email" />
      <Field name="telefon" label="Telefon" autoComplete="tel" />

      <label htmlFor="kategorie" style={S.label}>Kategorie</label>
      <select id="kategorie" name="kategorie" style={S.input} defaultValue="">
        <option value="">— bitte wählen —</option>
        {KATEGORIEN.map((k) => (
          <option key={k}>{k}</option>
        ))}
      </select>

      {/* Зона нужна прежде всего там, где площадка не выбрана: без неё
          непонятно, что вообще предлагать. */}
      <label htmlFor="zone" style={S.label}>Gewünschte Zone</label>
      <select id="zone" name="zone" style={S.input} defaultValue={stand ? '' : 'noch offen'}>
        <option value="">— bitte wählen —</option>
        {ZONEN.map((z) => (
          <option key={z}>{z}</option>
        ))}
      </select>

      <label htmlFor="marken" style={S.label}>Marken</label>
      <input
        id="marken"
        name="marken"
        placeholder="z. B. Triumph, Rokker"
        style={S.input}
      />
      <span style={S.hint}>Mehrere durch Komma trennen</span>

      <label htmlFor="nachricht" style={S.label}>Nachricht</label>
      <textarea id="nachricht" name="nachricht" rows={3} style={S.input} />

      {/* Ловушка для ботов. Человеку не видна и не доступна с клавиатуры. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label style={S.consent}>
        <input type="checkbox" name="consent" required />
        <span>
          Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert
          und verwendet werden. Details in der <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a>.
        </span>
      </label>

      <label style={S.consent}>
        <input type="checkbox" name="marketing_consent" />
        <span>
          Informieren Sie mich über Neuigkeiten zur MOTO-ZÜRICH. Jederzeit abbestellbar.
        </span>
      </label>

      <button type="submit" disabled={busy} style={S.button}>
        {busy ? 'Wird gesendet…' : 'Anfrage senden'}
      </button>

      {error && <p style={S.error}>{error}</p>}
    </form>
  );
}

function Field({ name, label, type = 'text', required, autoComplete }) {
  return (
    <>
      <label htmlFor={name} style={S.label}>
        {label}
        {required && <span style={{ color: '#A32A25' }}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        style={S.input}
      />
    </>
  );
}

const S = {
  form: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 },
  intro: { fontWeight: 700, margin: '0 0 8px', fontSize: 14 },
  label: { fontSize: 12, color: 'var(--muted)', marginTop: 6 },
  input: {
    padding: '8px 10px',
    border: '1px solid var(--line)',
    borderRadius: 3,
    width: '100%',
    fontSize: 14,
    minHeight: 44,
    color: 'var(--ink)',
  },
  hint: { fontSize: 11, color: 'var(--muted)' },
  consent: { display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.45 },
  button: { marginTop: 12, padding: '11px 14px', border: 0, borderRadius: 3, background: 'var(--blue)', color: '#fff', fontWeight: 600, cursor: 'pointer', minHeight: 44 },
  error: { fontSize: 12, color: '#A32A25', marginTop: 8 },
  done: { marginTop: 16, padding: '12px 14px', border: '1px solid #1B7A5A', borderRadius: 3, fontSize: 13 },
  doneText: { margin: '6px 0 0', color: 'var(--muted)' },
};
