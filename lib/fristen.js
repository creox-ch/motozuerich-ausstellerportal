import { supabaseAdmin } from './supabase';

/**
 * Сроки и задачи экспонента — чек-лист в Übersicht.
 *
 * Даты живут в таблице, а не в разметке: восемь из одиннадцати Messeleitung
 * ещё не назвала, и когда назовёт, это будет заполнение таблицы, а не задача
 * на разработку. Пустая дата показывается как красное XX — ровно как
 * в прототипе, где рядом стоит подпись «Rot markierte Daten sind intern noch
 * nicht festgelegt».
 *
 * Отметки «сделано» экспонент не ставит руками. Галочка, которую ставит сам
 * человек, отвечает на вопрос «считает ли он это сделанным», а не «сделано ли».
 * Поэтому отмечено только то, что мы знаем по данным: заполнен ли профиль,
 * отправлены ли заказы. Про остальное честно ничего не утверждаем.
 */

/** Заглушка вместо неназначенной даты. Та же, что в прототипе. */
export const XX = 'XX.XX.2027';

const FIELDS = 'id, sortierung, titel, hinweis, datum, datum_bis, ziel';

/** «17.02.2027» · «19.–21.02.2027» · «XX.XX.2027», если срока ещё нет. */
export function formatFrist(frist) {
  const von = tag(frist?.datum);
  if (!von) return XX;

  const bis = tag(frist?.datum_bis);
  if (!bis) return von;

  // Внутри одного месяца день от диапазона не отрывается: «19.–21.02.2027»,
  // а не «19.02.2027–21.02.2027».
  const [tagVon, monatVon, jahrVon] = von.split('.');
  const [tagBis, monatBis, jahrBis] = bis.split('.');
  if (monatVon === monatBis && jahrVon === jahrBis) {
    return `${tagVon}.–${tagBis}.${monatBis}.${jahrBis}`;
  }
  return `${von}–${bis}`;
}

/** Дата из базы приходит как «2027-02-17». */
function tag(iso) {
  if (!iso) return null;
  const [jahr, monat, tag_] = String(iso).split('-');
  return jahr && monat && tag_ ? `${tag_}.${monat}.${jahr}` : null;
}

/**
 * Что мы можем утверждать про выполнение — по данным, а не по галочке.
 *
 * @returns {boolean|null} null = «не знаем», и тогда ничего не показываем
 */
export function leiteStatusAb(fristId, fakten = {}) {
  switch (fristId) {
    case 'profil':
      return Boolean(fakten.profilVollstaendig);
    case 'technik':
      return Boolean(fakten.technikEingereicht);
    case 'marketing':
      return Boolean(fakten.marketingEingereicht);
    default:
      return null;
  }
}

/**
 * Профиль считается заполненным, когда в нём есть всё, что уходит
 * в каталог: категория, описание и логотип. Без логотипа запись
 * в Event-Guide выглядит пустой, поэтому «почти заполнен» здесь
 * не считается.
 */
export function profilVollstaendig(company) {
  return Boolean(company?.kategorie && company?.beschreibung && company?.logo_path);
}

/** Сроки с отметками для конкретной компании. */
export async function fristenFuerCompany(companyId) {
  const [{ data: fristen }, { data: company }, { data: auftraege }] = await Promise.all([
    supabaseAdmin.from('mz_fristen').select(FIELDS).eq('aktiv', true).order('sortierung'),
    supabaseAdmin
      .from('mz_companies')
      .select('kategorie, beschreibung, logo_path')
      .eq('id', companyId)
      .maybeSingle(),
    supabaseAdmin
      .from('mz_service_auftraege')
      .select('bereich, eingereicht_am')
      .eq('company_id', companyId),
  ]);

  const eingereicht = new Set(
    (auftraege || []).filter((a) => a.eingereicht_am).map((a) => a.bereich)
  );

  const fakten = {
    profilVollstaendig: profilVollstaendig(company),
    technikEingereicht: eingereicht.has('technik'),
    marketingEingereicht: eingereicht.has('marketing'),
  };

  return (fristen || []).map((f) => ({
    ...f,
    anzeige: formatFrist(f),
    offen: !f.datum,
    erledigt: leiteStatusAb(f.id, fakten),
  }));
}
