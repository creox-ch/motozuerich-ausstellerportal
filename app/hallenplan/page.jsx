import { cookies } from 'next/headers';
import { supabaseAdmin } from '../../lib/supabase';
import { PREIS_COOKIE } from '../../lib/preisgate';
import {
  formatPrice,
  leistungenInklusive,
  loadPriceRules,
  priceFor,
  PREIS_NETTO_HINWEIS,
} from '../../lib/pricing';
import HallPlan from './hall-plan';
import OffeneAnfrage from './offene-anfrage';
import SiteFooter from '../site-footer';

export const dynamic = 'force-dynamic';

const BASE = process.env.PUBLIC_BASE_URL || 'https://motozuerich-ausstellerportal.vercel.app';
const TITLE = 'Hallenplan und freie Standflächen · MOTO-ZÜRICH 2027';
const DESCRIPTION =
  'Freie Standflächen an der MOTO-ZÜRICH 2027, 19.–21. Februar 2027, StageOne und Halle 550, Zürich-Oerlikon. Fläche im Hallenplan wählen und unverbindlich anfragen.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Индексацию НЕ открываем: решение 2026-08-11 — портал наружу не выставляем,
  // поисковая витрина проекта это motozuerich.ch. Ссылку на план рассылают
  // руками. Наследуется noindex из каркаса, и это правильное состояние.
  //
  // Open Graph при этом нужен: он не про поиск, а про то, как выглядит ссылка
  // в письме и мессенджере — то есть ровно там, где её и будут отправлять.
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: `${BASE}/hallenplan`,
    siteName: 'MOTO-ZÜRICH 2027',
    title: TITLE,
    description: DESCRIPTION,
  },
};

/**
 * Публичный план залов. Входа не требует — это витрина, а не кабинет.
 *
 * Цену считаем на сервере и отдаём уже строкой: правила ценообразования
 * наружу не выносим, клиенту незачем знать, что почём считается за метр,
 * а что за место.
 */
export default async function HallenplanPage() {
  // Открыты ли цены этому посетителю. Решает сервер: цена не должна попасть
  // в разметку до того, как оставлен контакт. Гейт, прячущий цену стилями,
  // обходится за две секунды и злит ровно того покупателя, который нам нужен.
  const preiseFrei = Boolean(cookies().get(PREIS_COOKIE)?.value);

  const [{ data: stands }, rules] = await Promise.all([
    supabaseAdmin
      .from('mz_stands')
      .select(
        'id, plan_id, halle, lage, breite_m, tiefe_m, flaeche_m2, pos_x, pos_y, plan_b, plan_t, status, gaeste_karten, aussteller_karten'
      )
      .order('id'),
    loadPriceRules(),
  ]);

  // Цену и состав услуг считаем на сервере: правила ценообразования наружу
  // не выносим, клиенту незачем знать, что почём считается.
  //
  // Пока контакт не оставлен, поля цены не заполняются ВОВСЕ — не скрываются,
  // а отсутствуют. Иначе сумма уедет в HTML и гейт станет декорацией.
  // Number(null) равен нулю, а не NaN. Без этой отсечки площадка без размеров
  // превратилась бы в «0 × 0 m», а зал без плана — в кучу прямоугольников
  // в левом верхнем углу. Та же ловушка, что уже ловил тест на соседей.
  const zahl = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

  const withPrice = (stands || []).map((s) => ({
    ...s,
    breite_m: zahl(s.breite_m),
    tiefe_m: zahl(s.tiefe_m),
    pos_x: zahl(s.pos_x),
    pos_y: zahl(s.pos_y),
    plan_b: zahl(s.plan_b),
    plan_t: zahl(s.plan_t),
    ...(preiseFrei
      ? {
          preis: formatPrice(priceFor(s, rules)),
          preisHinweis: PREIS_NETTO_HINWEIS,
          inklusive: leistungenInklusive(s.halle),
        }
      : {}),
  }));

  const hallen = [...new Set(withPrice.map((s) => s.halle))];
  const frei = withPrice.filter((s) => s.status === 'frei').length;

  return (
    <main style={S.wrap}>
      <header style={S.head}>
        <div style={S.mark}>
          MOTO-<span style={{ color: 'var(--signal)' }}>ZÜRICH</span>
        </div>
        <div style={S.sub}>19.–21. Februar 2027 · StageOne und Halle 550, Zürich-Oerlikon</div>
      </header>

      <div style={S.body}>
        <h1 style={S.h1}>Hallenplan und freie Flächen</h1>
        <p style={S.lead}>
          {frei} von {withPrice.length} Flächen sind derzeit frei. Wählen Sie eine Fläche
          im Plan und stellen Sie eine unverbindliche Anfrage — Offerte und Vertrag folgen
          von der Messeleitung.
        </p>

        {withPrice.length === 0 ? (
          <p style={S.lead}>Der Hallenplan wird gerade vorbereitet.</p>
        ) : (
          <HallPlan stands={withPrice} hallen={hallen} preiseFrei={preiseFrei} />
        )}

        <section style={S.weitere}>
          <h2 style={S.h2}>Nichts Passendes gefunden?</h2>
          <p style={S.weitereText}>
            Sagen Sie uns, was Sie brauchen — Fläche, Zone, Budget. Wir melden uns mit
            passenden Vorschlägen, auch wenn die gewünschte Fläche gerade belegt ist.
          </p>
          <OffeneAnfrage />
        </section>

        <p style={S.foot}>
          Bereits angemeldet? <a href="/">Zum Ausstellerportal</a>
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}

const S = {
  wrap: { minHeight: '100vh' },
  head: { background: 'var(--ink)', padding: '16px 28px' },
  mark: { color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.4px' },
  sub: { marginTop: 5, fontSize: 12, color: '#93a9c6' },
  body: { padding: '26px 28px 70px', maxWidth: 1180 },
  h1: { fontSize: 26, letterSpacing: '-0.6px', margin: '0 0 6px', fontWeight: 700 },
  lead: { color: 'var(--muted)', margin: '0 0 22px', maxWidth: '68ch' },
  foot: { marginTop: 26, fontSize: 13, color: 'var(--muted)' },
  weitere: {
    marginTop: 30,
    background: '#fff',
    border: '1px solid var(--line)',
    borderRadius: 3,
    padding: '18px 20px',
    maxWidth: 680,
  },
  h2: { fontSize: 16, margin: '0 0 8px', fontWeight: 700 },
  weitereText: { color: 'var(--muted)', fontSize: 14, margin: '0 0 14px', maxWidth: '62ch' },
};
