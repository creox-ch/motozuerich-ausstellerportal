import { requirePageCompany } from '../../../lib/auth';
import { formatSize, standsOfCompany } from '../../../lib/stands';
import NochNicht from '../noch-nicht';

export const dynamic = 'force-dynamic';

/**
 * Ausweise & Tickets — предпросмотр раздела, БЕЗ сбора данных.
 *
 * Здесь нет ни одного поля ввода, и это не недоделка, а суть страницы.
 * Раздел собирает имена и функции сотрудников экспонента — самую
 * чувствительную категорию данных в портале. Человек из такого списка нам
 * ничего не разрешал: его вносит работодатель, а спрашивают с нас.
 *
 * Поэтому форма появится только после того, как Datenschutz будет вычитан
 * юристом (см. docs/rechtliches-review.md). Пока страница показывает, как
 * раздел будет устроен, и чего от экспонента потребуется, — этого достаточно,
 * чтобы человек успел собрать список заранее, и при этом мы ничего не храним.
 *
 * ⚠️ Правило на будущее: любая правка, добавляющая сюда input, textarea или
 * загрузку файла, требует проверенного Datenschutz. Не «желательно» — иначе
 * портал начинает хранить чужие персональные данные в ту же секунду.
 */
export default async function AusweisePage() {
  const session = await requirePageCompany();
  const stands = await standsOfCompany(session.companyId);

  return (
    <>
      <h1 style={S.h1}>Ausweise &amp; Tickets</h1>
      <p style={S.lead}>
        Das Kontingent an Ausstellerausweisen richtet sich nach Ihrer Standfläche. Das
        Standpersonal erfassen Sie später hier — einzeln oder als Liste.
      </p>

      <NochNicht was="Dieser Bereich">
        Er nimmt Personendaten Ihrer Mitarbeitenden auf. Wir schalten ihn erst frei, wenn
        die Datenschutzerklärung dafür rechtlich geprüft ist — vorher speichern wir hier
        nichts. Was Sie vorbereiten können, steht unten.
      </NochNicht>

      <div className="split">
        <section style={S.card}>
          <h2 style={S.h2}>Standpersonal</h2>
          <p style={S.text}>
            Pro Person brauchen wir Vorname, Nachname und Funktion am Stand. Erfassen können
            Sie einzeln oder als Liste.
          </p>
          <ul style={S.req}>
            <li>Excel oder CSV mit den Spalten Vorname, Nachname, Funktion</li>
            <li>Eine Zeile pro Person</li>
            <li>Die Vorlage stellen wir hier bereit, sobald der Bereich offen ist</li>
          </ul>

          <dl style={S.dl}>
            <Kv label="Ihre Fläche" wert={stands.length > 0 ? formatSize(stands[0]) : '—'} />
            <Kv
              label="Kontingent Ausweise"
              wert={<span style={S.xx}>XX</span>}
              hinweis="abhängig von der Standfläche"
            />
          </dl>
          <p style={S.hint}>
            Die Formel für das Kontingent steht noch nicht fest. Sobald sie da ist, sehen
            Sie hier Ihre konkrete Zahl.
          </p>
        </section>

        <section style={S.card}>
          <h2 style={S.h2}>Kundeneinladungen</h2>
          <p style={S.text}>
            Gutscheincodes für Ihre Kunden. Ein Code gilt für ein Tagesticket, einlösbar im
            Ticketshop.
          </p>
          <dl style={S.dl}>
            <Kv label="Kontingent" wert={<span style={S.xx}>XX</span>} />
            <Kv label="Gültig" wert="19.–21.02.2027" />
          </dl>
          <p style={S.hint}>
            Codes und Codeliste erscheinen hier, sobald der Bereich offen ist. Für
            Gutscheincodes brauchen wir keine Personendaten — sie hängen nur an der
            Freischaltung des Bereichs.
          </p>
        </section>
      </div>

      <p style={S.footer}>
        Fragen zu Ausweisen? Schreiben Sie uns über{' '}
        <a href="/portal/nachrichten" className="tap">
          Nachrichten
        </a>
        .
      </p>
    </>
  );
}

function Kv({ label, wert, hinweis }) {
  return (
    <div style={S.kv}>
      <dt style={S.dt}>
        {label}
        {hinweis && <span style={S.dtHint}>{hinweis}</span>}
      </dt>
      <dd style={S.dd}>{wert}</dd>
    </div>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 18px', maxWidth: '68ch' },
  card: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '18px 20px',
  },
  h2: { fontSize: 15, margin: '0 0 10px', fontWeight: 700 },
  text: { fontSize: 14, margin: '0 0 12px', color: 'var(--muted)' },
  req: { margin: '0 0 14px', paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 },
  dl: { margin: 0 },
  kv: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 0',
    borderTop: '1px solid var(--line)',
  },
  dt: { color: 'var(--muted)', margin: 0, fontSize: 13 },
  dtHint: { display: 'block', fontSize: 11 },
  dd: { margin: 0, fontWeight: 600, textAlign: 'right', fontSize: 13 },
  xx: { color: '#A32A25', fontWeight: 700 },
  hint: { fontSize: 12, color: 'var(--muted)', marginTop: 12, marginBottom: 0 },
  footer: { fontSize: 13, color: 'var(--muted)', marginTop: 20 },
};
