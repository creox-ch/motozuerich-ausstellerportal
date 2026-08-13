import { supabaseAdmin } from './supabase';

/**
 * Площадки компании.
 *
 * Каталог заполнен из прототипа (см. supabase/seed-stands.sql). Статус и
 * привязку к компании ведёт Messeleitung — приложение их только читает:
 * продажа площади происходит вне портала, по телефону и почте.
 */

/**
 * Что показываем экспоненту про его площадку.
 *
 * Контингенты карт входят сюда, потому что они часть того, что экспонент
 * купил вместе с площадью, — и раздел Ausweise берёт их отсюда.
 */
const FIELDS =
  'id, halle, lage, breite_m, tiefe_m, flaeche_m2, status, gaeste_karten, aussteller_karten';

/**
 * То же плюс координаты — для отрисовки плана.
 *
 * `company_id` сюда намеренно НЕ входит, хотя он в таблице есть. Отдать его
 * в браузер — значит сказать каждому экспоненту, какие площадки принадлежат
 * одному участнику; состав выставки до анонса раскрывать не наше решение.
 * Свои площадки страница определяет на сервере отдельным запросом.
 */
const PLAN_FIELDS = `${FIELDS}, pos_x, pos_y`;

/**
 * Площадки, закреплённые за компанией. Обычно одна, но их может быть
 * несколько: компания берёт вторую площадь или стенд в другом зале.
 */
export async function standsOfCompany(companyId) {
  if (!companyId) return [];
  const { data, error } = await supabaseAdmin
    .from('mz_stands')
    .select(FIELDS)
    .eq('company_id', companyId)
    .order('id');

  if (error) {
    console.error('standsOfCompany: не удалось прочитать площадки', error);
    return [];
  }
  return data || [];
}

/**
 * Все площадки указанных залов — для плана в кабинете.
 *
 * Читаем зал целиком, а не только свои площадки: смысл раздела в том, чтобы
 * экспонент видел своё место в контексте зала. Статусы соседних площадок
 * и так открыты на публичном плане, поэтому нового здесь не раскрывается.
 */
export async function standsInHallen(hallen) {
  if (!Array.isArray(hallen) || hallen.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from('mz_stands')
    .select(PLAN_FIELDS)
    .in('halle', hallen)
    .order('id');

  if (error) {
    console.error('standsInHallen: не удалось прочитать зал', error);
    return [];
  }
  return data || [];
}

/**
 * Насколько далеко может стоять площадка, чтобы всё ещё считаться соседней.
 *
 * Подобрано по геометрии каталога: между площадками одного ряда зазор около
 * полуметра, между рядами — около полутора. Два метра захватывают и тех, кто
 * стоит вплотную, и тех, кто напротив через узкий проход, но не весь зал.
 * Число — эвристика, а не факт из данных; когда разметят StageOne, его стоит
 * перепроверить на новом зале.
 */
export const NACHBAR_ABSTAND_M = 2;

/**
 * Метры из базы. PostgREST отдаёт numeric строкой ('10.50'), поэтому приведение
 * нужно — но пропуск обязан остаться пропуском.
 *
 * `Number(null)` равен нулю и проходит проверку на конечность. Без этой отсечки
 * площадка без координат превращалась в точку в углу зала и попадала в соседи
 * к тому, кто стоит у начала отсчёта. Ровно это и поймал тест.
 */
function meter(raw) {
  if (raw === null || raw === undefined || raw === '') return NaN;
  return Number(raw);
}

/** Прямоугольник площадки в метрах. */
function box(stand) {
  const x1 = meter(stand?.pos_x);
  const y1 = meter(stand?.pos_y);
  return {
    halle: stand?.halle,
    x1,
    y1,
    x2: x1 + meter(stand?.breite_m),
    y2: y1 + meter(stand?.tiefe_m),
  };
}

function vermessen(b) {
  return [b.x1, b.y1, b.x2, b.y2].every((n) => Number.isFinite(n));
}

/** Пересекаются ли прямоугольники, если первый раздуть на `abstand` во все стороны. */
function beruehrt(eigen, fremd, abstand) {
  return (
    fremd.x1 <= eigen.x2 + abstand &&
    fremd.x2 >= eigen.x1 - abstand &&
    fremd.y1 <= eigen.y2 + abstand &&
    fremd.y2 >= eigen.y1 - abstand
  );
}

/**
 * Соседи: площадки, стоящие рядом со своими.
 *
 * Чистая функция — соседство считается по координатам, а не запросом к базе:
 * так его можно проверить тестом на выдуманном зале, не заводя данных.
 *
 * Площадка без координат соседом не станет и ничего не сломает: незаполненная
 * геометрия в каталоге вероятна (StageOne пока не размечен вовсе), а падать
 * из-за неё страница кабинета не должна.
 *
 * @param {Array<object>} alle все площадки залов, где стоит экспонент
 * @param {Array<object>} eigene его собственные площадки
 * @param {number} abstand допуск в метрах
 */
export function nachbarn(alle = [], eigene = [], abstand = NACHBAR_ABSTAND_M) {
  const eigeneIds = new Set(eigene.map((s) => s?.id).filter(Boolean));
  const eigeneBoxen = eigene.map(box).filter(vermessen);
  if (eigeneBoxen.length === 0) return [];

  return alle
    .filter((s) => s?.id && !eigeneIds.has(s.id))
    .filter((s) => {
      const fremd = box(s);
      if (!vermessen(fremd)) return false;
      // Зал сверяем у каждой своей площадки отдельно: у компании их может быть
      // две в разных залах, и координаты там своя система отсчёта. Без этой
      // проверки стенд из Halle 550 попал бы в соседи по совпадению координат.
      return eigeneBoxen.some(
        (eigen) => eigen.halle === s.halle && beruehrt(eigen, fremd, abstand)
      );
    })
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

/**
 * Человеческая подпись размера: «10 × 8 m · 80 m²».
 *
 * Отсутствие площади проверяем ДО Number(): `Number(null)` равен нулю и
 * проходит как конечное число, из-за чего площадка без площади показывала
 * бы «· 0 m²». Площадь приходит из базы строкой ('80.00') — PostgREST
 * отдаёт numeric так, — поэтому приведение к числу всё равно нужно.
 */
export function formatSize(stand) {
  if (!stand) return '';

  const flaeche = meter(stand.flaeche_m2);
  const area = Number.isFinite(flaeche) ? `${Math.round(flaeche)} m²` : '';

  // Размеров может не быть вовсе: в прайсе у части площадок указана только
  // площадь. Тогда показываем её одну — «null × null m» хуже, чем «20 m²».
  const breite = meter(stand.breite_m);
  const tiefe = meter(stand.tiefe_m);
  if (!Number.isFinite(breite) || !Number.isFinite(tiefe)) return area;

  return `${stand.breite_m} × ${stand.tiefe_m} m${area ? ` · ${area}` : ''}`;
}
