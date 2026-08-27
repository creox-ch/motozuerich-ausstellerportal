'use client';

import { useMemo, useState } from 'react';
import { planLabel, planRect } from '../../../lib/plan-geometrie';
import {
  EIGENE_FARBE,
  STAND_RAHMEN,
  STATUS_FARBE,
  STATUS_TEXT,
  statusFarbe,
  statusText,
} from '../../../lib/stand-status';

/**
 * План зала в кабинете. Рисуется из того же каталога, что публичный план,
 * но решает другую задачу: показать своё место, а не выбрать свободное.
 * Поэтому здесь нет ни фильтра «только свободные», ни формы заявки.
 *
 * Разметка повторяет публичный план сознательно: SVG скрыт от вспомогательных
 * технологий целиком, а управление — список настоящих кнопок под ним. На 375px
 * прямоугольник площадки получается около 5×4 пикселей, пальцем в него
 * не попасть, и у выставки 71% трафика с телефонов.
 */
export default function EigenerPlan({ alle, eigeneIds, hallen, nachbarIds }) {
  const eigene = useMemo(() => new Set(eigeneIds), [eigeneIds]);
  const nachbar = useMemo(() => new Set(nachbarIds), [nachbarIds]);

  const [halle, setHalle] = useState(hallen[0] || '');
  // Открываем на своей площадке: ради неё человек сюда и пришёл.
  const [selectedId, setSelectedId] = useState(eigeneIds[0] || null);

  const visible = useMemo(() => alle.filter((s) => s.halle === halle), [alle, halle]);
  const selected = visible.find((s) => s.id === selectedId) || null;

  // Площадка без геометрии в план не попадает, но остаётся в списке под ним.
  // Без этого отбора Number(null) даёт ноль, и такая площадка рисуется точкой
  // в левом верхнем углу поверх чужого стенда.
  const gezeichnet = useMemo(
    () => visible.map((s) => ({ stand: s, rect: planRect(s) })).filter((e) => e.rect),
    [visible]
  );

  const box = useMemo(() => {
    if (gezeichnet.length === 0) return { w: 70, h: 30 };
    return {
      w: Math.max(...gezeichnet.map((e) => e.rect.x + e.rect.w)) + 2,
      h: Math.max(...gezeichnet.map((e) => e.rect.y + e.rect.h)) + 2,
    };
  }, [gezeichnet]);

  return (
    <div className="split">
      <div>
        {hallen.length > 1 && (
          <div style={S.tabs}>
            {hallen.map((h) => (
              <button
                key={h}
                type="button"
                className="tap"
                onClick={() => {
                  setHalle(h);
                  setSelectedId(eigeneIds.find((id) => alle.some((s) => s.id === id && s.halle === h)) || null);
                }}
                style={h === halle ? { ...S.tab, ...S.tabOn } : S.tab}
              >
                {h}
              </button>
            ))}
          </div>
        )}

        {gezeichnet.length > 0 && (
        <svg viewBox={`-1 -1 ${box.w} ${box.h}`} style={S.svg} aria-hidden="true" focusable="false">
          {gezeichnet.map(({ stand: s, rect }) => {
            const mein = eigene.has(s.id);
            return (
              <g key={s.id} onClick={() => setSelectedId(s.id)} style={{ cursor: 'pointer' }}>
                <rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.w}
                  height={rect.h}
                  fill={mein ? EIGENE_FARBE : statusFarbe(s.status)}
                  stroke={s.id === selectedId ? '#0E1E37' : mein ? '#0E1E37' : STAND_RAHMEN}
                  strokeWidth={s.id === selectedId ? 0.35 : mein ? 0.3 : 0.12}
                />
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h / 2 + 0.35}
                  textAnchor="middle"
                  style={{
                    fontSize: 1.2,
                    fill: '#12253F',
                    fontWeight: mein ? 700 : 400,
                    pointerEvents: 'none',
                  }}
                >
                  {planLabel(s)}
                </text>
              </g>
            );
          })}
        </svg>
        )}

        <div style={S.legend}>
          <span style={S.legendItem}>
            <span style={{ ...S.dot, background: EIGENE_FARBE, borderColor: '#0E1E37' }} /> Ihre Fläche
          </span>
          {Object.entries(STATUS_TEXT).map(([key, label]) => (
            <span key={key} style={S.legendItem}>
              <span style={{ ...S.dot, background: STATUS_FARBE[key] }} /> {label}
            </span>
          ))}
        </div>

        <ul className="stand-list">
          {visible.map((s) => {
            const mein = eigene.has(s.id);
            const rolle = mein ? 'Ihre Fläche' : nachbar.has(s.id) ? 'Nachbarfläche' : statusText(s.status);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={s.id === selectedId}
                  // Роль площадки словами: из содержимого кнопки её не вычитать,
                  // а цвет кружка вспомогательной технологии ничего не говорит.
                  aria-label={`Stand ${s.id}, ${rolle}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <span
                    style={{
                      ...S.dot,
                      background: mein ? EIGENE_FARBE : statusFarbe(s.status),
                      borderColor: mein ? '#0E1E37' : STAND_RAHMEN,
                      flex: '0 0 auto',
                    }}
                  />
                  <b>{s.id}</b>
                  {mein && <span style={S.tagMein}>Ihre</span>}
                  {!mein && nachbar.has(s.id) && <span style={S.tagNachbar}>Nachbar</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <aside style={S.panel}>
        {selected ? (
          <StandDetail stand={selected} mein={eigene.has(selected.id)} nachbar={nachbar.has(selected.id)} />
        ) : (
          <p style={S.muted}>Wählen Sie eine Fläche im Plan.</p>
        )}
      </aside>
    </div>
  );
}

function StandDetail({ stand, mein, nachbar }) {
  return (
    <>
      <h2 style={S.h2}>
        Stand {stand.id}
        {mein && <span style={S.badgeMein}>Ihre Fläche</span>}
        {!mein && nachbar && <span style={S.badgeNachbar}>Nachbar</span>}
      </h2>

      <dl style={{ margin: 0 }}>
        <Row label="Halle" value={stand.halle} />
        <Row label="Lage" value={stand.lage || '—'} />
        {/* Номер на публичном плане отличается только в StageOne: там наши
            «Kubus 1» и «Fläche 5» называются K1 и E5B. Показываем оба, пока
            две нумерации не сведены в одну. */}
        {stand.plan_id && stand.plan_id !== stand.id && (
          <Row label="Auf motozuerich.ch" value={stand.plan_id} />
        )}
        {/* Сторон может не быть — в прайсе у StageOne указана одна площадь.
            «null × null m» хуже отсутствия строки. */}
        {stand.breite_m != null && stand.tiefe_m != null && (
          <Row label="Format" value={`${stand.breite_m} × ${stand.tiefe_m} m`} />
        )}
        <Row label="Fläche" value={`${Math.round(Number(stand.flaeche_m2))} m²`} />
        {!mein && <Row label="Status" value={statusText(stand.status)} />}
      </dl>

      {mein ? (
        <p style={S.hint}>
          Fragen zur Fläche oder Wunsch nach Änderung? Melden Sie sich bei der
          Messeleitung.
        </p>
      ) : (
        // Кто именно стоит рядом — не показываем: раскрывать состав участников
        // друг другу мы не уполномочены. См. комментарий в page.jsx.
        <p style={S.hint}>Wer diese Fläche belegt, gibt die Messeleitung bekannt.</p>
      )}
    </>
  );
}

function Row({ label, value }) {
  return (
    <div style={S.kv}>
      <dt style={S.dt}>{label}</dt>
      <dd style={S.dd}>{value}</dd>
    </div>
  );
}


const S = {
  tabs: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  tab: { padding: '7px 14px', border: '1px solid var(--line)', background: '#fff', borderRadius: 3, cursor: 'pointer', fontSize: 14 },
  tabOn: { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)', fontWeight: 600 },
  svg: { width: '100%', background: '#fff', border: '1px solid var(--line)', borderRadius: 3 },
  legend: { display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 2, border: `1px solid ${STAND_RAHMEN}`, display: 'inline-block' },
  panel: { background: '#fff', border: '1px solid var(--line)', borderRadius: 3, padding: '18px 20px' },
  h2: { fontSize: 16, margin: '0 0 12px', fontWeight: 700 },
  badgeMein: { fontSize: 11, padding: '2px 7px', borderRadius: 2, fontWeight: 700, marginLeft: 6, background: EIGENE_FARBE },
  badgeNachbar: { fontSize: 11, padding: '2px 7px', borderRadius: 2, fontWeight: 600, marginLeft: 6, background: '#E7EDF6', color: 'var(--muted)' },
  tagMein: { marginLeft: 'auto', fontSize: 11, fontWeight: 700 },
  tagNachbar: { marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' },
  kv: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--line)' },
  dt: { color: 'var(--muted)', margin: 0, fontSize: 13 },
  dd: { margin: 0, fontWeight: 600, textAlign: 'right', fontSize: 13 },
  muted: { color: 'var(--muted)', fontSize: 13, margin: 0 },
  hint: { fontSize: 12, color: 'var(--muted)', marginTop: 12 },
};
