import { test, expect } from '@playwright/test';
import { leistungenInklusive, PREIS_NETTO_HINWEIS, priceFor, formatPrice } from '../../lib/pricing';

/**
 * Unit: цены Halle D из прайса Messeleitung от 13.08.2026.
 *
 * Проверяется не арифметика, а то, что портал показывает ровно те суммы,
 * что стоят в прайсе, и не забывает сказать, что они без НДС.
 */

const REGELN = [
  { gilt_fuer: 'alle', schluessel: null, modell: 'pauschal', betrag_rappen: null, waehrung: 'CHF' },
  { gilt_fuer: 'stand', schluessel: 'D01', modell: 'pauschal', betrag_rappen: 1340000, waehrung: 'CHF' },
  { gilt_fuer: 'stand', schluessel: 'D08', modell: 'pauschal', betrag_rappen: 400000, waehrung: 'CHF' },
];

const D01 = { id: 'D01', halle: 'Halle D', flaeche_m2: '80.00' };
const D08 = { id: 'D08', halle: 'Halle D', flaeche_m2: '20.00' };
const H07 = { id: 'H07', halle: 'Halle 550', flaeche_m2: '48.00' };

test('цена площадки берётся из её собственного правила', () => {
  expect(formatPrice(priceFor(D01, REGELN))).toBe("CHF 13'400");
  expect(formatPrice(priceFor(D08, REGELN))).toBe("CHF 4'000");
});

test('цена НЕ умножается на площадь: модель pauschal', () => {
  // Ловушка на будущее. Прайс задаёт сумму за площадку целиком, и если кто-то
  // однажды поменяет модель на pro_m2, D01 превратится в 1'072'000 франков.
  const preis = priceFor(D01, REGELN);
  expect(preis.rappen).toBe(1340000);
  expect(preis.modell).toBe('pauschal');
});

test('площадка без своей цены остаётся без цены, а не берёт чужую', () => {
  // Halle 550 ещё не оценена: каталог зала не настоящий. Запасное правило
  // «alle» существует, но суммы в нём нет — значит интерфейс покажет XX.
  expect(priceFor(H07, REGELN).known).toBe(false);
  expect(formatPrice(priceFor(H07, REGELN))).toBe(null);
});

test('пометка про НДС существует и не пустая', () => {
  // Она стоит рядом с каждой суммой; пустая строка тихо убрала бы её.
  expect(PREIS_NETTO_HINWEIS).toContain('MwSt');
});

test('в цену Halle D входит всё, кроме ковролина', () => {
  const d = leistungenInklusive('Halle D');
  expect(d).toContain('Strom T-13 inkl. Verbrauch');
  expect(d).toContain('Hochleistungs-WLAN');
  // В прайсе у Halle D и Halle 550 ковролин помечен ✕, у StageOne ✓.
  expect(d.some((l) => l.includes('Teppich'))).toBe(false);
});

test('в StageOne ковролин входит', () => {
  expect(leistungenInklusive('StageOne').some((l) => l.includes('Teppich'))).toBe(true);
});

test('у залов разные световые концепции — как в прайсе', () => {
  expect(leistungenInklusive('Halle D').some((l) => l.includes('Flächige'))).toBe(true);
  expect(leistungenInklusive('Halle 550').some((l) => l.includes('StageOne'))).toBe(true);
});

test('неизвестный зал не получает выдуманный список', () => {
  expect(leistungenInklusive('Halle X')).toEqual([]);
  expect(leistungenInklusive(undefined)).toEqual([]);
});
