import { test, expect } from '@playwright/test';
import { meter, planLabel, planRect } from '../../lib/plan-geometrie';

/**
 * Unit: геометрия плана.
 *
 * Главное, что тут защищается, — разделение двух комплектов размеров.
 * Договорные (`breite_m`/`tiefe_m`) идут в счёт, нарисованные (`plan_b`/
 * `plan_t`) только в SVG. Если однажды кто-то «упростит» их в одну пару,
 * площадь площадки поедет вслед за картинкой, и заметят это в договоре.
 */

test('прямоугольник берётся с плана, а не из договорных сторон', () => {
  // Galerie 2: продано 84 м², нарисована полоса 18.19 × 2.78.
  const stand = { pos_x: 25.4, pos_y: 8.27, plan_b: 18.19, plan_t: 2.78, breite_m: 30, tiefe_m: 2.8 };
  expect(planRect(stand)).toEqual({ x: 25.4, y: 8.27, w: 18.19, h: 2.78 });
});

test('без плановых размеров берём договорные', () => {
  // Так рисуется зал, размеченный нами, а не снятый с публичного плана.
  const stand = { pos_x: 10, pos_y: 4, plan_b: null, plan_t: null, breite_m: 8, tiefe_m: 5 };
  expect(planRect(stand)).toEqual({ x: 10, y: 4, w: 8, h: 5 });
});

test('без координат прямоугольника нет — это null, а не ноль', () => {
  // «Fläche 18» и «Fläche 23 Erweiterung» на публичном плане отсутствуют.
  // Number(null) равен нулю, и без отсечки такая площадка нарисовалась бы
  // точкой в левом верхнем углу поверх чужого стенда.
  expect(planRect({ pos_x: null, pos_y: null, flaeche_m2: 50 })).toBe(null);
  expect(planRect({ pos_x: 12, pos_y: null, plan_b: 5, plan_t: 4 })).toBe(null);
  expect(planRect({ pos_x: 12, pos_y: 3 })).toBe(null);
  expect(planRect(null)).toBe(null);
  expect(planRect(undefined)).toBe(null);
});

test('числа приходят из базы строками — это не должно ломать расчёт', () => {
  // PostgREST отдаёт numeric строкой: '25.40', а не числом.
  const stand = { pos_x: '25.40', pos_y: '8.27', plan_b: '18.19', plan_t: '2.78' };
  expect(planRect(stand)).toEqual({ x: 25.4, y: 8.27, w: 18.19, h: 2.78 });
});

test('пустая строка — это пропуск, а не ноль', () => {
  expect(Number.isNaN(meter(''))).toBe(true);
  expect(Number.isNaN(meter(null))).toBe(true);
  expect(Number.isNaN(meter(undefined))).toBe(true);
  expect(meter('0')).toBe(0);
  expect(meter(0)).toBe(0);
});

test('подпись на плане — короткая с публичного плана', () => {
  // «Galerie 8A» в прямоугольник 3 × 2.8 м не влезает ни при каком масштабе.
  expect(planLabel({ id: 'Galerie 8A', plan_id: 'G8A' })).toBe('G8A');
  expect(planLabel({ id: 'Kubus 1', plan_id: 'K1' })).toBe('K1');
});

test('в Halle D и Halle 550 подпись не меняется — номера там совпадают', () => {
  expect(planLabel({ id: 'D17', plan_id: 'D17' })).toBe('D17');
  expect(planLabel({ id: 'H27', plan_id: 'H27' })).toBe('H27');
});

test('без номера на публичном плане подписываем своим', () => {
  expect(planLabel({ id: 'Fläche 18', plan_id: null })).toBe('Fläche 18');
  expect(planLabel({ id: 'Fläche 18' })).toBe('Fläche 18');
  expect(planLabel(null)).toBe('');
});
