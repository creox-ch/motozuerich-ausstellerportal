import { test, expect } from '@playwright/test';
import { formatSize, nachbarn, NACHBAR_ABSTAND_M } from '../../lib/stands';

/**
 * Unit: подпись размера площадки.
 *
 * Площадь считает база (генерируемая колонка), приложение её только
 * показывает — поэтому здесь проверяется форматирование, а не арифметика.
 * Это осознанно: дублировать расчёт в коде означало бы иметь два источника
 * правды, которые однажды разойдутся.
 */

test('размер и площадь в одну строку', () => {
  expect(formatSize({ breite_m: 10, tiefe_m: 8, flaeche_m2: 80 })).toBe('10 × 8 m · 80 m²');
});

test('площадь приходит из базы строкой — это не должно ломать вывод', () => {
  // PostgREST отдаёт numeric строкой: '80.00', а не числом.
  expect(formatSize({ breite_m: 10, tiefe_m: 8, flaeche_m2: '80.00' })).toBe('10 × 8 m · 80 m²');
});

test('без площади показываем хотя бы размеры', () => {
  expect(formatSize({ breite_m: 6, tiefe_m: 4, flaeche_m2: null })).toBe('6 × 4 m');
});

test('пустая площадка не роняет страницу', () => {
  expect(formatSize(null)).toBe('');
  expect(formatSize(undefined)).toBe('');
});

test('без размеров показываем одну площадь, а не «null × null»', () => {
  // Реальный случай: у H27 и у всех 61 площадки StageOne в прайсе указана
  // только площадь. Стороны неизвестны, и выдумывать их нельзя.
  expect(formatSize({ breite_m: null, tiefe_m: null, flaeche_m2: 20 })).toBe('20 m²');
  expect(formatSize({ flaeche_m2: '120.00' })).toBe('120 m²');
});

test('без размеров и без площади — пустая строка, а не мусор', () => {
  expect(formatSize({ breite_m: null, tiefe_m: null, flaeche_m2: null })).toBe('');
});

/**
 * Unit: соседи на плане кабинета.
 *
 * Зал выдуман нарочно — с числами из настоящего каталога тест проверял бы
 * заодно и данные, а от их правки краснел бы, ничего не сломав в коде.
 *
 * Геометрия зала ниже (метры, начало отсчёта слева сверху):
 *
 *   A1 (0..10, 0..8)  A2 (10.5..20.5, 0..8)   ← вплотную, зазор 0.5
 *   A3 (0..10, 30..38)                        ← далеко, 22 м вниз
 *   B1 — та же геометрия, что A1, но другой зал
 */
const A1 = { id: 'A1', halle: 'Halle A', pos_x: 0, pos_y: 0, breite_m: 10, tiefe_m: 8 };
const A2 = { id: 'A2', halle: 'Halle A', pos_x: 10.5, pos_y: 0, breite_m: 10, tiefe_m: 8 };
const A3 = { id: 'A3', halle: 'Halle A', pos_x: 0, pos_y: 30, breite_m: 10, tiefe_m: 8 };
const B1 = { id: 'B1', halle: 'Halle B', pos_x: 0, pos_y: 0, breite_m: 10, tiefe_m: 8 };

test('соседняя площадка попадает в список, дальняя — нет', () => {
  const gefunden = nachbarn([A1, A2, A3], [A1]).map((s) => s.id);
  expect(gefunden).toEqual(['A2']);
});

test('своя площадка себе не сосед', () => {
  const gefunden = nachbarn([A1, A2], [A1]).map((s) => s.id);
  expect(gefunden).not.toContain('A1');
});

test('совпадение координат в другом зале соседом не делает', () => {
  // Координаты B1 те же, что у A1: у каждого зала своя система отсчёта.
  // Без сверки зала эта площадка оказалась бы соседом сама себе через зал.
  const gefunden = nachbarn([A1, B1], [A1]).map((s) => s.id);
  expect(gefunden).toEqual([]);
});

test('допуск решает, кто сосед: за его пределами — уже нет', () => {
  // Ровно на границе допуска и сразу за ней. Тест краснеет и от изменения
  // формулы, и от подмены допуска на другое число.
  const anDerGrenze = { ...A3, id: 'G1', pos_y: 8 + NACHBAR_ABSTAND_M };
  const knappDahinter = { ...A3, id: 'G2', pos_y: 8 + NACHBAR_ABSTAND_M + 0.01 };

  expect(nachbarn([anDerGrenze], [A1]).map((s) => s.id)).toEqual(['G1']);
  expect(nachbarn([knappDahinter], [A1]).map((s) => s.id)).toEqual([]);
});

test('площадка без координат не сосед и не исключение', () => {
  // Такие строки реальны: «Fläche 18» и «Fläche 23 Erweiterung» на публичном
  // плане отсутствуют, координат для них взять неоткуда.
  const ohneGeometrie = { id: 'S1', halle: 'Halle A', pos_x: null, pos_y: null, breite_m: null, tiefe_m: null };
  expect(() => nachbarn([ohneGeometrie, A2], [A1])).not.toThrow();
  expect(nachbarn([ohneGeometrie, A2], [A1]).map((s) => s.id)).toEqual(['A2']);
});

test('без своих площадок соседей нет', () => {
  expect(nachbarn([A1, A2], [])).toEqual([]);
});

test('числа из базы приходят строками — это не должно ломать расчёт', () => {
  // PostgREST отдаёт numeric строкой: '10.50', а не числом. При сравнении
  // строк '10.5' <= '10' даёт неверный ответ, поэтому приведение обязательно.
  const alsText = { ...A2, pos_x: '10.50', pos_y: '0.00', breite_m: '10.00', tiefe_m: '8.00' };
  const meinsAlsText = { ...A1, pos_x: '0.00', pos_y: '0.00', breite_m: '10.00', tiefe_m: '8.00' };
  expect(nachbarn([alsText], [meinsAlsText]).map((s) => s.id)).toEqual(['A2']);
});

test('порядок не зависит от порядка в ответе базы', () => {
  const vorwaerts = nachbarn([A2, A3, { ...A2, id: 'A0' }], [A1]).map((s) => s.id);
  const rueckwaerts = nachbarn([{ ...A2, id: 'A0' }, A3, A2], [A1]).map((s) => s.id);
  expect(vorwaerts).toEqual(rueckwaerts);
  expect(vorwaerts).toEqual(['A0', 'A2']);
});
