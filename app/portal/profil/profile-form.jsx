'use client';

import { useState } from 'react';
import { KATEGORIEN, MAX_BESCHREIBUNG, formatBrands, parseBrands } from '../../../lib/profile';
import LogoUpload from './logo-upload';

/**
 * Форма профиля с живым предпросмотром карточки каталога.
 *
 * Предпросмотр не украшение: экспонент пишет текст, который увидят посетители
 * на сайте, в приложении и в Event-Guide. Без него человек заполняет поля
 * вслепую и узнаёт результат, когда каталог уже свёрстан.
 */
export default function ProfileForm({ initial, logoUrl }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    uid_nummer: initial.uid_nummer || '',
    strasse: initial.strasse || '',
    ort: initial.ort || '',
    kontakt_name: initial.kontakt_name || '',
    kontakt_tel: initial.kontakt_tel || '',
    rechnungs_email: initial.rechnungs_email || '',
    kategorie: initial.kategorie || '',
    website: initial.website || '',
    brands: formatBrands(initial.brands),
    beschreibung: initial.beschreibung || '',
    public_email: initial.public_email || '',
    instagram: initial.instagram || '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(null);
  };

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setSaved(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, brands: parseBrands(form.brands) }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setSaved(new Date().toLocaleTimeString('de-CH'));
      } else {
        setErrors(data.errors || {});
        if (!data.errors) setErrors({ _: data.error || 'Speichern fehlgeschlagen.' });
      }
    } catch {
      setErrors({ _: 'Keine Verbindung. Bitte versuchen Sie es erneut.' });
    } finally {
      setBusy(false);
    }
  }

  const rest = MAX_BESCHREIBUNG - form.beschreibung.length;
  const brands = parseBrands(form.brands);

  return (
    <form onSubmit={save} style={S.grid}>
      <div>
        <section style={S.card}>
          <h2 style={S.h2}>Stammdaten</h2>
          <p style={S.hint}>Für Vertrag und Rechnung. Diese Angaben sind nicht öffentlich.</p>
          <Field id="name" label="Firmenname" value={form.name} onChange={set('name')} error={errors.name} required />
          <Field id="uid_nummer" label="UID-Nummer" value={form.uid_nummer} onChange={set('uid_nummer')} error={errors.uid_nummer} placeholder="CHE-123.456.789" />
          <Field id="strasse" label="Strasse und Nummer" value={form.strasse} onChange={set('strasse')} error={errors.strasse} />
          <Field id="ort" label="PLZ und Ort" value={form.ort} onChange={set('ort')} error={errors.ort} />
          <Field id="kontakt_name" label="Ansprechperson Messe" value={form.kontakt_name} onChange={set('kontakt_name')} error={errors.kontakt_name} />
          <Field id="kontakt_tel" label="Telefon" value={form.kontakt_tel} onChange={set('kontakt_tel')} error={errors.kontakt_tel} />
          <Field id="rechnungs_email" label="Rechnungs-E-Mail" type="email" value={form.rechnungs_email} onChange={set('rechnungs_email')} error={errors.rechnungs_email} />
        </section>

        <section style={{ ...S.card, marginTop: 16 }}>
          <h2 style={S.h2}>Verzeichniseintrag</h2>
          <p style={S.hint}>
            Diese Angaben erscheinen auf der Website, in der App und im Event-Guide.
          </p>

          <div style={S.row}>
            <label htmlFor="kategorie" style={S.label}>Kategorie</label>
            <select id="kategorie" value={form.kategorie} onChange={set('kategorie')} style={S.input}>
              <option value="">— bitte wählen —</option>
              {KATEGORIEN.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            {errors.kategorie && <span style={S.err}>{errors.kategorie}</span>}
          </div>

          <Field id="website" label="Website" value={form.website} onChange={set('website')} error={errors.website} placeholder="https://" />
          <Field id="brands" label="Marken" value={form.brands} onChange={set('brands')} error={errors.brands} placeholder="BMW, Ducati, Honda" hint="Mit Komma trennen." />

          <div style={S.row}>
            <label htmlFor="beschreibung" style={S.label}>
              Kurzbeschreibung <span style={{ color: rest < 0 ? '#A32A25' : 'var(--muted)' }}>({rest})</span>
            </label>
            <textarea
              id="beschreibung"
              rows={4}
              value={form.beschreibung}
              onChange={set('beschreibung')}
              style={{ ...S.input, resize: 'vertical' }}
            />
            {errors.beschreibung && <span style={S.err}>{errors.beschreibung}</span>}
          </div>

          <Field id="public_email" label="E-Mail für Besucheranfragen" type="email" value={form.public_email} onChange={set('public_email')} error={errors.public_email} />
          <Field id="instagram" label="Instagram" value={form.instagram} onChange={set('instagram')} error={errors.instagram} placeholder="motozuerich" />

          {/* Логотип сохраняется сразу при выборе файла, отдельно от формы:
              иначе человек выбирает файл, забывает нажать «Speichern»
              и уходит с ощущением, что загрузил. */}
          <LogoUpload initialUrl={logoUrl} />
        </section>

        {errors._ && <p style={S.errBox}>{errors._}</p>}

        <div style={S.actions}>
          <button type="submit" disabled={busy} style={S.button}>
            {busy ? 'Wird gespeichert…' : 'Speichern'}
          </button>
          {saved && <span role="status" style={S.saved}>Gespeichert um {saved}</span>}
        </div>
      </div>

      <aside style={S.card}>
        <h2 style={S.h2}>So sehen Besucher Ihren Eintrag</h2>
        <div style={S.preview}>
          <div style={S.logo}>{(form.name || '?').trim().charAt(0).toUpperCase()}</div>
          <div>
            <div style={S.pName}>{form.name || 'Firmenname'}</div>
            <div style={S.pMeta}>{form.kategorie || 'Kategorie'}</div>
          </div>
        </div>
        <p style={S.pText}>
          {form.beschreibung || 'Hier erscheint Ihre Kurzbeschreibung.'}
        </p>
        {brands.length > 0 && (
          <p style={S.pBrands}>{brands.join(' · ')}</p>
        )}
        <p style={S.hint}>
          Der Eintrag wird vor der Veröffentlichung von der Messeleitung geprüft.
        </p>
      </aside>
    </form>
  );
}

function Field({ id, label, value, onChange, error, type = 'text', placeholder, hint, required }) {
  return (
    <div style={S.row}>
      <label htmlFor={id} style={S.label}>
        {label}
        {required && <span style={{ color: '#A32A25' }}> *</span>}
      </label>
      <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} style={S.input} />
      {hint && !error && <span style={S.fieldHint}>{hint}</span>}
      {error && <span style={S.err}>{error}</span>}
    </div>
  );
}

const S = {
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)', gap: 16, alignItems: 'start' },
  card: { background: '#fff', border: '1px solid var(--line)', borderRadius: 3, padding: '18px 20px' },
  h2: { fontSize: 15, margin: '0 0 6px', fontWeight: 700 },
  hint: { fontSize: 12, color: 'var(--muted)', margin: '0 0 14px' },
  row: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 },
  label: { fontSize: 13, color: 'var(--muted)' },
  input: { padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 3, background: '#fff', width: '100%' },
  fieldHint: { fontSize: 12, color: 'var(--muted)' },
  err: { fontSize: 12, color: '#A32A25' },
  errBox: { fontSize: 13, color: '#A32A25', border: '1px solid #A32A25', borderRadius: 2, padding: '9px 11px' },
  actions: { display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 },
  button: { padding: '11px 18px', border: 0, borderRadius: 3, background: 'var(--blue)', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  saved: { fontSize: 13, color: '#1B7A5A' },
  preview: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 },
  logo: { width: 44, height: 44, borderRadius: 3, background: 'var(--ink)', color: 'var(--signal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 },
  pName: { fontWeight: 700 },
  pMeta: { fontSize: 12, color: 'var(--muted)' },
  pText: { fontSize: 13, margin: '0 0 10px' },
  pBrands: { fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' },
};
