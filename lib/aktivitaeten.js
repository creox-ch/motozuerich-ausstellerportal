import { supabaseAdmin } from './supabase';

/**
 * Активности на стенде: заявка в программу выставки, Event-Guide и на сайт.
 *
 * Списки форматов, площадок и дней взяты из прототипа — это согласованный
 * набор, а не выдумка приложения. Приходящее из браузера значение сверяется
 * с ними: свободный текст в поле «Ort» превратился бы в пять написаний одной
 * площадки, и программу пришлось бы сводить руками.
 */

export const FORMATE = [
  'Probefahrt oder Test',
  'Wettbewerb oder Verlosung',
  'Demo oder Vorführung',
  'Workshop',
  'Gast oder Signierstunde',
  'Premiere oder Neuheit',
  'Messeaktion',
  'Anderes',
];

export const ORTE = [
  'Am eigenen Stand',
  'Live Arena',
  'Action Zone',
  'Adventure Camp, Halle D',
  'Aussenfläche',
];

/** Дни выставки. Даты известны, поэтому стоят настоящими. */
export const TAGE = [
  { id: 'fr', label: 'Freitag 19.02.' },
  { id: 'sa', label: 'Samstag 20.02.' },
  { id: 'so', label: 'Sonntag 21.02.' },
];

export const STATUS = ['eingereicht', 'angenommen', 'abgelehnt'];

/** Длина описания — та же, что в прототипе: строка в Event-Guide. */
export const MAX_BESCHREIBUNG = 200;

const FIELDS =
  'id, titel, format, beschreibung, tage, zeiten, ort, bedarf, bild_pfad, status, created_at';

function str(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Проверка заявки.
 *
 * @returns {{ok: true, value: object}|{ok: false, error: string}}
 */
export function validateAktivitaet(input = {}) {
  const titel = str(input.titel, 120);
  if (!titel) return { ok: false, error: 'Titel ist erforderlich.' };

  const format = str(input.format, 60);
  if (!FORMATE.includes(format)) return { ok: false, error: 'Unbekanntes Format.' };

  const ort = str(input.ort, 60);
  if (ort && !ORTE.includes(ort)) return { ok: false, error: 'Unbekannter Ort.' };

  const beschreibung = str(input.beschreibung, MAX_BESCHREIBUNG + 1);
  if (beschreibung.length > MAX_BESCHREIBUNG) {
    return {
      ok: false,
      error: `Kurzbeschreibung ist zu lang (maximal ${MAX_BESCHREIBUNG} Zeichen).`,
    };
  }

  const erlaubteTage = new Set(TAGE.map((t) => t.id));
  const tage = Array.isArray(input.tage)
    ? [...new Set(input.tage.filter((t) => erlaubteTage.has(t)))]
    : [];

  // День определяет, когда активность попадёт в программу. Без него заявка
  // не значит ничего, и молча подставить «все дни» нельзя: это обязательство
  // экспонента работать три дня подряд.
  if (tage.length === 0) {
    return { ok: false, error: 'Bitte mindestens einen Messetag wählen.' };
  }

  // Порядок дней задаём мы, а не браузер: иначе «So, Fr» в программе.
  const sortiert = TAGE.map((t) => t.id).filter((id) => tage.includes(id));

  return {
    ok: true,
    value: {
      titel,
      format,
      beschreibung,
      tage: sortiert,
      zeiten: str(input.zeiten, 120),
      ort: ort || ORTE[0],
      bedarf: str(input.bedarf, 200),
    },
  };
}

/** Читаемая подпись дней: «Fr · Sa». */
export function formatTage(tage = []) {
  const label = { fr: 'Fr', sa: 'Sa', so: 'So' };
  return TAGE.map((t) => t.id)
    .filter((id) => tage.includes(id))
    .map((id) => label[id])
    .join(' · ');
}

/** Заявки одной компании. */
export async function aktivitaetenFuerCompany(companyId) {
  if (!companyId) return [];

  const { data, error } = await supabaseAdmin
    .from('mz_aktivitaeten')
    .select(FIELDS)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('aktivitaetenFuerCompany: не удалось прочитать', error);
    return [];
  }
  return data || [];
}

/** Все заявки для Messeleitung — новые сверху. */
export async function alleAktivitaeten() {
  const { data, error } = await supabaseAdmin
    .from('mz_aktivitaeten')
    .select(`${FIELDS}, notiz_intern, mz_companies(name)`)
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    console.error('alleAktivitaeten: не удалось прочитать', error);
    return [];
  }
  return data || [];
}
