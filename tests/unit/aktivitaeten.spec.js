import { test, expect } from '@playwright/test';
import { FORMATE, ORTE, formatTage, validateAktivitaet } from '../../lib/aktivitaeten';

/**
 * Unit: заявка на активность.
 *
 * Списки форматов и площадок закрытые — свободный текст в поле «Ort»
 * превратился бы в пять написаний одной площадки, и сводить программу
 * пришлось бы руками.
 */

const GUELTIG = {
  titel: 'Probefahrt Reiseenduro',
  format: FORMATE[0],
  tage: ['sa'],
};

test('минимальная заявка проходит', () => {
  const res = validateAktivitaet(GUELTIG);
  expect(res.ok).toBe(true);
  expect(res.value.titel).toBe('Probefahrt Reiseenduro');
});

test('без названия не принимается', () => {
  expect(validateAktivitaet({ ...GUELTIG, titel: '  ' }).ok).toBe(false);
});

test('без дня не принимается, а не подставляется «все дни»', () => {
  // Подставить три дня значило бы записать экспонента на работу все выходные.
  const res = validateAktivitaet({ ...GUELTIG, tage: [] });
  expect(res.ok).toBe(false);
  expect(res.error).toContain('Messetag');
});

test('выдуманный день отбрасывается', () => {
  const res = validateAktivitaet({ ...GUELTIG, tage: ['sa', 'mo'] });
  expect(res.ok).toBe(true);
  expect(res.value.tage).toEqual(['sa']);
});

test('дни приводятся к порядку выставки, а не к порядку из браузера', () => {
  const res = validateAktivitaet({ ...GUELTIG, tage: ['so', 'fr', 'sa'] });
  expect(res.value.tage).toEqual(['fr', 'sa', 'so']);
});

test('повторы дней схлопываются', () => {
  const res = validateAktivitaet({ ...GUELTIG, tage: ['sa', 'sa', 'sa'] });
  expect(res.value.tage).toEqual(['sa']);
});

test('чужой формат и чужая площадка не принимаются', () => {
  expect(validateAktivitaet({ ...GUELTIG, format: 'Strassenrennen' }).ok).toBe(false);
  expect(validateAktivitaet({ ...GUELTIG, ort: 'Hinter der Halle' }).ok).toBe(false);
});

test('площадка по умолчанию — свой стенд', () => {
  expect(validateAktivitaet(GUELTIG).value.ort).toBe(ORTE[0]);
});

test('слишком длинное описание отклоняется, а не режется', () => {
  // Обрезанное описание уйдёт в печать Event-Guide оборванным на полуслове.
  const res = validateAktivitaet({ ...GUELTIG, beschreibung: 'x'.repeat(201) });
  expect(res.ok).toBe(false);
  expect(res.error).toContain('200');
});

test('описание ровно в предел проходит', () => {
  expect(validateAktivitaet({ ...GUELTIG, beschreibung: 'x'.repeat(200) }).ok).toBe(true);
});

test('подпись дней читается и держит порядок', () => {
  expect(formatTage(['so', 'fr'])).toBe('Fr · So');
  expect(formatTage([])).toBe('');
});
