import { requirePageCompany } from '../../../lib/auth';
import { formatSize, nachbarn, standsInHallen, standsOfCompany } from '../../../lib/stands';
import EigenerPlan from './eigener-plan';

export const dynamic = 'force-dynamic';

/**
 * План залов внутри кабинета: «вот ваш стенд и вот кто рядом».
 *
 * Отличие от публичного плана — не в данных, а в задаче. Там человек выбирает
 * свободное место, здесь смотрит на уже своё: заявка не нужна, зато нужны
 * ориентиры для монтажа и понимание, что вокруг.
 *
 * Названий соседних компаний тут нет намеренно: состав выставки до анонса —
 * не наша информация, чтобы раскрывать её экспонентам друг о друге. Статусы
 * площадок и так видны на публичном плане.
 */
export default async function PortalHallenplan() {
  // Гард в самой странице, а не только в layout: в Next 14 они рендерятся
  // параллельно, и решение layout перенаправить странице не помешает.
  const session = await requirePageCompany();

  const eigeneKurz = await standsOfCompany(session.companyId);
  const hallen = [...new Set(eigeneKurz.map((s) => s.halle).filter(Boolean))];

  // Свои площадки берём из того же ответа, что и весь зал: иначе координаты
  // для подсветки и координаты для расчёта соседей пришли бы из двух разных
  // запросов и могли разъехаться между ними.
  const alle = await standsInHallen(hallen);
  const eigeneIds = eigeneKurz.map((s) => s.id);
  const eigene = alle.filter((s) => eigeneIds.includes(s.id));
  const nachbarListe = nachbarn(alle, eigene);

  return (
    <>
      <h1 style={S.h1}>Hallenplan</h1>

      {eigene.length === 0 ? (
        <>
          <p style={S.lead}>
            Ihnen ist noch keine Fläche zugeteilt. Sobald die Messeleitung Ihren Stand
            eingetragen hat, sehen Sie ihn hier im Plan.
          </p>
          <p style={S.lead}>
            <a href="/hallenplan" className="tap">
              Zum öffentlichen Hallenplan →
            </a>
          </p>
        </>
      ) : (
        <>
          <p style={S.lead}>
            Ihre Fläche ist hervorgehoben. Tippen Sie auf eine andere Fläche, um zu sehen,
            was Sie dort erwartet.
          </p>

          <div style={S.summary}>
            {eigene.map((stand) => (
              <div key={stand.id} style={S.summaryItem}>
                <div style={S.summaryId}>Stand {stand.id}</div>
                <div style={S.summaryText}>
                  {stand.halle}
                  {stand.lage ? ` · ${stand.lage}` : ''} · {formatSize(stand)}
                </div>
              </div>
            ))}
          </div>

          <EigenerPlan
            alle={alle}
            eigeneIds={eigeneIds}
            hallen={hallen}
            nachbarIds={nachbarListe.map((s) => s.id)}
          />

          <p style={S.hint}>
            Der Plan zeigt den aktuellen Stand der Planung. Massgebend für den Aufbau sind
            die Angaben der Messeleitung.
          </p>
        </>
      )}
    </>
  );
}

const S = {
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 4px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 18px', maxWidth: '68ch' },
  summary: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 },
  summaryItem: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderLeft: '3px solid var(--signal)',
    borderRadius: 3,
    padding: '10px 14px',
  },
  summaryId: { fontWeight: 700, fontSize: 15 },
  summaryText: { color: 'var(--muted)', fontSize: 13, marginTop: 2 },
  hint: { fontSize: 12, color: 'var(--muted)', marginTop: 18, maxWidth: '68ch' },
};
