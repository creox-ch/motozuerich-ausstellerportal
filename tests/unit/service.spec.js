import { test, expect } from '@playwright/test';
import { MAX_MENGE, countPositions, normalizeOrder } from '../../lib/service';

/**
 * Unit: заказ техники.
 *
 * Ключевое: клиент влияет только на количества. Состав каталога задаём мы,
 * и присланный выдуманный идентификатор не должен ни записаться, ни уронить
 * запрос — он просто игнорируется.
 */

const KATALOG = ['strom_3_5kw', 'bartisch', 'teppich'];

test('обычный заказ проходит', () => {
  const r = normalizeOrder({ strom_3_5kw: 2, bartisch: 1 }, KATALOG);
  expect(r.ok).toBe(true);
  expect(r.positionen).toEqual([
    { position_id: 'strom_3_5kw', menge: 2 },
    { position_id: 'bartisch', menge: 1 },
  ]);
});

test('позиция не из каталога молча отбрасывается', () => {
  const r = normalizeOrder({ strom_3_5kw: 1, ausgedacht: 99 }, KATALOG);
  expect(r.ok).toBe(true);
  expect(r.positionen.map((p) => p.position_id)).toEqual(['strom_3_5kw']);
});

test('ноль сохраняется — видно, что позицию смотрели и отказались', () => {
  const r = normalizeOrder({ bartisch: 0 }, KATALOG);
  expect(r.ok).toBe(true);
  expect(r.positionen).toEqual([{ position_id: 'bartisch', menge: 0 }]);
});

test('отрицательное и мусор превращаются в ноль, а не в ошибку', () => {
  // Это ввод из поля со стрелочками — ругаться тут не за что.
  const r = normalizeOrder({ bartisch: -5, teppich: 'много' }, KATALOG);
  expect(r.ok).toBe(true);
  expect(r.positionen).toEqual([
    { position_id: 'bartisch', menge: 0 },
    { position_id: 'teppich', menge: 0 },
  ]);
});

test('дробное округляется вниз', () => {
  expect(normalizeOrder({ teppich: 2.9 }, KATALOG).positionen[0].menge).toBe(2);
});

test('слишком большое количество отбивается', () => {
  // Опечатка не должна превращаться в заказ на тысячу стульев.
  const r = normalizeOrder({ barhocker: 1, bartisch: MAX_MENGE + 1 }, KATALOG);
  expect(r.ok).toBe(false);
  expect(r.error).toContain(String(MAX_MENGE));
});

test('запрос без единой известной позиции → ошибка', () => {
  expect(normalizeOrder({ ausgedacht: 1 }, KATALOG).ok).toBe(false);
});

test('не объект → ошибка, а не падение', () => {
  expect(normalizeOrder(null, KATALOG).ok).toBe(false);
  expect(normalizeOrder('строка', KATALOG).ok).toBe(false);
});

test('счётчик считает только реально заказанное', () => {
  expect(countPositions([{ menge: 0 }, { menge: 3 }, { menge: 0 }, { menge: 1 }])).toBe(2);
  expect(countPositions([])).toBe(0);
  expect(countPositions()).toBe(0);
});
