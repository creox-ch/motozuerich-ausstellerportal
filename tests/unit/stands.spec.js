import { test, expect } from '@playwright/test';
import { formatSize } from '../../lib/stands';

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
