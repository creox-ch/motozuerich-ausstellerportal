'use client';

import { useMemo, useState } from 'react';
import AnfrageForm from './anfrage-form';
import PreisGate from './preis-gate';
import {
  STAND_RAHMEN,
  STATUS_FARBE,
  STATUS_TEXT,
  statusFarbe,
  statusText,
} from '../../lib/stand-status';

/**
 * План залов. Рисуется из каталога площадок в базе — тех же данных, что
 * видит кабинет, поэтому расходиться им негде.
 *
 * Координаты и размеры в метрах по обеим осям, поэтому масштаб один и план
 * не сплющен. В прототипе ширина масштабировалась, а глубина нет.
 */
export default function HallPlan({ stands, hallen, preiseFrei = false }) {
  const [halle, setHalle] = useState(hallen[0] || 'Halle D');
  const [selectedId, setSelectedId] = useState(null);
  const [nurFrei, setNurFrei] = useState(false);

  const visible = useMemo(() => stands.filter((s) => s.halle === halle), [stands, halle]);
  const selected = visible.find((s) => s.id === selectedId) || null;

  // Зал может продаваться без чертежа: площадки, цены и размеры известны,
  // а разметка ещё не готова. Тогда показываем список — он и на телефоне
  // основной способ выбора, так что теряется только картинка.
  const gezeichnet = useMemo(
    () => visible.filter((s) => s.pos_x !== null && s.pos_y !== null),
    [visible]
  );
  const hatPlan = gezeichnet.length > 0;

  const box = useMemo(() => {
    if (gezeichnet.length === 0) return { w: 70, h: 30 };
    return {
      w: Math.max(...gezeichnet.map((s) => s.pos_x + s.breite_m)) + 2,
      h: Math.max(...gezeichnet.map((s) => s.pos_y + s.tiefe_m)) + 2,
    };
  }, [gezeichnet]);

  return (
    <div className="split">
      <div>
        <div style={S.tabs}>
          {hallen.map((h) => (
            <button
              key={h}
              type="button"
              className="tap"
              onClick={() => {
                setHalle(h);
                setSelectedId(null);
              }}
              style={h === halle ? { ...S.tab, ...S.tabOn } : S.tab}
            >
              {h}
            </button>
          ))}
          <label style={S.filter}>
            <input type="checkbox" checked={nurFrei} onChange={(e) => setNurFrei(e.target.checked)} />
            Nur freie Flächen
          </label>
        </div>

        {!hatPlan && (
          <p style={S.ohnePlan}>
            Der Hallenplan wird derzeit finalisiert. Flächen, Grössen und Preise stehen
            fest — wählen Sie unten eine Fläche aus.
          </p>
        )}

        {/* План — визуальный слой, поэтому он скрыт от вспомогательных
            технологий целиком. Доступное управление — список площадок ниже:
            иначе каждая площадка объявлялась бы дважды, а из плана ещё и
            без размера. Мышью план по-прежнему кликается. */}
        {hatPlan && (
        <svg
          viewBox={`-1 -1 ${box.w} ${box.h}`}
          style={S.svg}
          aria-hidden="true"
          focusable="false"
        >
          {gezeichnet.map((s) => {
            const frei = s.status === 'frei';
            const dim = nurFrei && !frei ? 0.25 : 1;
            return (
              <g
                key={s.id}
                opacity={dim}
                onClick={() => setSelectedId(s.id)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={s.pos_x}
                  y={s.pos_y}
                  width={s.breite_m}
                  height={s.tiefe_m}
                  fill={statusFarbe(s.status)}
                  stroke={s.id === selectedId ? '#0E1E37' : STAND_RAHMEN}
                  strokeWidth={s.id === selectedId ? 0.35 : 0.12}
                />
                <text
                  x={s.pos_x + s.breite_m / 2}
                  y={s.pos_y + s.tiefe_m / 2 + 0.35}
                  textAnchor="middle"
                  style={{ fontSize: 1.2, fill: '#12253F', pointerEvents: 'none' }}
                >
                  {s.id}
                </text>
              </g>
            );
          })}
        </svg>
        )}

        <div style={S.legend}>
          {Object.entries(STATUS_TEXT).map(([key, label]) => (
            <span key={key} style={S.legendItem}>
              <span style={{ ...S.dot, background: STATUS_FARBE[key] }} /> {label}
            </span>
          ))}
        </div>

        {/* Список площадок настоящими кнопками. На телефоне это основной
            способ выбора: прямоугольники в плане там получаются от 5×4
            пикселей. Плюс SVG-группы вспомогательные технологии видят
            плохо, а обычную кнопку — всегда. */}
        <ul className="stand-list">
          {visible
            .filter((s) => !nurFrei || s.status === 'frei')
            .map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={s.id === selectedId}
                  // Статус в подписи: из содержимого кнопки он не читается,
                  // цвет кружка вспомогательной технологии ничего не говорит.
                  aria-label={`Stand ${s.id}, ${statusText(s.status)}, ${Math.round(Number(s.flaeche_m2))} Quadratmeter`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <span style={{ ...S.dot, background: statusFarbe(s.status), flex: '0 0 auto' }} />
                  <b>{s.id}</b>
                  <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>
                    {Math.round(Number(s.flaeche_m2))} m²
                  </span>
                </button>
              </li>
            ))}
        </ul>
      </div>

      <aside style={S.panel}>
        {selected ? (
          <StandDetail stand={selected} preiseFrei={preiseFrei} />
        ) : (
          <>
            <h2 style={S.h2}>Fläche wählen</h2>
            <p style={S.muted}>
              Tippen Sie im Plan auf eine Fläche, um Details zu sehen und eine Anfrage zu stellen.
            </p>
          </>
        )}
      </aside>
    </div>
  );
}

function StandDetail({ stand, preiseFrei }) {
  const [open, setOpen] = useState(false);
  const frei = stand.status === 'frei';

  return (
    <>
      <h2 style={S.h2}>
        Stand {stand.id}{' '}
        <span style={{ ...S.badge, background: statusFarbe(stand.status) }}>
          {statusText(stand.status)}
        </span>
      </h2>

      <dl style={{ margin: 0 }}>
        <Row label="Halle" value={stand.halle} />
        {stand.lage && <Row label="Lage" value={stand.lage} />}
        {/* Размеров может не быть: в прайсе у части площадок указана только
            площадь. Строку тогда не рисуем вовсе — «null × null m» хуже
            отсутствия. */}
        {stand.breite_m != null && stand.tiefe_m != null && (
          <Row label="Format" value={`${stand.breite_m} × ${stand.tiefe_m} m`} />
        )}
        <Row label="Fläche" value={`${Math.round(Number(stand.flaeche_m2))} m²`} />
        {/* Пока контакт не оставлен, строки цены нет вовсе — ни суммы,
            ни заглушки. Место для неё занимает форма ниже. */}
        {preiseFrei && (
          <Row
            label="Preis"
            value={
              stand.preis ? (
                <>
                  {stand.preis}
                  {/* Пометка про НДС стоит вплотную к сумме, а не сноской внизу:
                      цена без неё читается как итоговая, и счёт потом
                      оказывается больше. */}
                  <span style={S.netto}> {stand.preisHinweis}</span>
                </>
              ) : (
                // Та же пометка, что в прототипе: красным помечено то, что
                // внутри ещё не определено. Правдоподобное число здесь было бы
                // хуже честного пропуска — его читают как предложение.
                <span style={S.xx}>XX</span>
              )
            }
          />
        )}
        {stand.aussteller_karten != null && (
          <Row label="Ausstellerausweise" value={stand.aussteller_karten} />
        )}
        {stand.gaeste_karten != null && (
          <Row label="Gästekarten" value={stand.gaeste_karten} />
        )}
      </dl>

      {!preiseFrei && <PreisGate stand={stand} />}

      {stand.preis && stand.inklusive?.length > 0 && (
        <>
          <p style={S.inklusiveTitel}>Im Preis enthalten</p>
          <ul style={S.inklusive}>
            {stand.inklusive.map((leistung) => (
              <li key={leistung}>{leistung}</li>
            ))}
          </ul>
        </>
      )}

      {preiseFrei && !stand.preis && (
        <p style={S.hint}>Die Preise für die Ausgabe 2027 werden noch festgelegt.</p>
      )}

      {frei ? (
        open ? (
          <AnfrageForm stand={stand} />
        ) : (
          <button type="button" onClick={() => setOpen(true)} style={S.button}>
            Diese Fläche anfragen
          </button>
        )
      ) : (
        <p style={S.hint}>
          {stand.status === 'reserviert'
            ? 'Reserviert. Wir melden uns, wenn die Fläche wieder frei wird.'
            : 'Diese Fläche ist bereits vergeben.'}
        </p>
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
  filter: { marginLeft: 'auto', fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'center' },
  svg: { width: '100%', background: '#fff', border: '1px solid var(--line)', borderRadius: 3 },
  ohnePlan: {
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '13px 15px',
    fontSize: 13,
    color: 'var(--muted)',
    margin: 0,
  },
  legend: { display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 2, border: `1px solid ${STAND_RAHMEN}`, display: 'inline-block' },
  panel: { background: '#fff', border: '1px solid var(--line)', borderRadius: 3, padding: '18px 20px' },
  h2: { fontSize: 16, margin: '0 0 12px', fontWeight: 700 },
  badge: { fontSize: 11, padding: '2px 7px', borderRadius: 2, fontWeight: 600, marginLeft: 4 },
  kv: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--line)' },
  dt: { color: 'var(--muted)', margin: 0, fontSize: 13 },
  dd: { margin: 0, fontWeight: 600, textAlign: 'right', fontSize: 13 },
  xx: { color: '#A32A25', fontWeight: 700 },
  netto: { color: 'var(--muted)', fontWeight: 400, fontSize: 11 },
  inklusiveTitel: { fontSize: 12, color: 'var(--muted)', margin: '14px 0 4px', fontWeight: 600 },
  inklusive: { margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 },
  muted: { color: 'var(--muted)', fontSize: 13, margin: 0 },
  hint: { fontSize: 12, color: 'var(--muted)', marginTop: 12 },
  button: { marginTop: 16, width: '100%', padding: '11px 14px', border: 0, borderRadius: 3, background: 'var(--blue)', color: '#fff', fontWeight: 600, cursor: 'pointer' },
};
