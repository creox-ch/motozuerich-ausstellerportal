import { test, expect } from '@playwright/test';
import { formatPrice, matchRule, priceFor } from '../../lib/pricing';

/**
 * Unit: цены на площади.
 *
 * Главное требование: пока сумма не задана, интерфейс НЕ должен показать
 * никакого числа. Подставленная правдоподобная цена читается как
 * предложение и переживает запуск незамеченной.
 */

const STAND = { id: 'D09', halle: 'Halle D', lage: 'Mittelblock, beidseitig offen', flaeche_m2: 80 };

test('нет правил → цена неизвестна', () => {
  expect(priceFor(STAND, []).known).toBe(false);
});

test('правило есть, но сумма не заполнена → цена неизвестна', () => {
  // Это состояние прямо сейчас в базе: строка-заглушка с NULL.
  const rules = [{ gilt_fuer: 'alle', schluessel: null, modell: null, betrag_rappen: null }];
  expect(priceFor(STAND, rules).known).toBe(false);
});

test('ноль — это «бесплатно», а не «неизвестно»', () => {
  const rules = [{ gilt_fuer: 'alle', schluessel: null, modell: 'pauschal', betrag_rappen: 0 }];
  const p = priceFor(STAND, rules);
  expect(p.known).toBe(true);
  expect(p.rappen).toBe(0);
});

test('за место целиком', () => {
  const rules = [{ gilt_fuer: 'alle', schluessel: null, modell: 'pauschal', betrag_rappen: 450000 }];
  expect(priceFor(STAND, rules).rappen).toBe(450000);
});

test('за квадратный метр — умножается на площадь', () => {
  const rules = [{ gilt_fuer: 'alle', schluessel: null, modell: 'pro_m2', betrag_rappen: 5000 }];
  // 80 м² × 50.00 CHF
  expect(priceFor(STAND, rules).rappen).toBe(400000);
});

test('частное правило побеждает общее', () => {
  const rules = [
    { gilt_fuer: 'alle', schluessel: null, modell: 'pauschal', betrag_rappen: 100000 },
    { gilt_fuer: 'halle', schluessel: 'Halle D', modell: 'pauschal', betrag_rappen: 200000 },
    { gilt_fuer: 'lage', schluessel: 'Mittelblock, beidseitig offen', modell: 'pauschal', betrag_rappen: 300000 },
    { gilt_fuer: 'stand', schluessel: 'D09', modell: 'pauschal', betrag_rappen: 400000 },
  ];
  expect(matchRule(STAND, rules).gilt_fuer).toBe('stand');
  expect(priceFor(STAND, rules).rappen).toBe(400000);
});

test('порядок правил в массиве не влияет на выбор', () => {
  const rules = [
    { gilt_fuer: 'stand', schluessel: 'D09', modell: 'pauschal', betrag_rappen: 400000 },
    { gilt_fuer: 'alle', schluessel: null, modell: 'pauschal', betrag_rappen: 100000 },
  ].reverse();
  expect(priceFor(STAND, rules).rappen).toBe(400000);
});

test('правило для другой площадки не применяется', () => {
  const rules = [{ gilt_fuer: 'stand', schluessel: 'D23', modell: 'pauschal', betrag_rappen: 999000 }];
  expect(priceFor(STAND, rules).known).toBe(false);
});

test('формат суммы — швейцарский, с апострофом', () => {
  expect(formatPrice({ known: true, rappen: 450000, waehrung: 'CHF' })).toBe("CHF 4'500");
  expect(formatPrice({ known: true, rappen: 123456789, waehrung: 'CHF' })).toBe("CHF 1'234'567.89");
  expect(formatPrice({ known: true, rappen: 5050, waehrung: 'CHF' })).toBe('CHF 50.50');
});

test('неизвестная цена не превращается в строку с числом', () => {
  // Возврат null — сигнал странице показать пометку «не определено».
  expect(formatPrice({ known: false })).toBeNull();
  expect(formatPrice(null)).toBeNull();
  expect(formatPrice(undefined)).toBeNull();
});
