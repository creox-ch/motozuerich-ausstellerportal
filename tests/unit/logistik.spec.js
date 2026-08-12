import { test, expect } from '@playwright/test';
import { FAHRZEUGE, MAX_PARKKARTEN, TORE, validateLogistik } from '../../lib/logistik';

/**
 * Unit: заявка на подвоз, вывоз и парковку.
 *
 * Это заявка, а не бронь: квоты ворот ещё не заданы. Проверяется, что
 * выдуманные значения не проезжают в базу и что пустая заявка не выглядит
 * отправленной.
 */

test('заявка с одним полем принимается', () => {
  const res = validateLogistik({ an_tor: TORE[0] });
  expect(res.ok).toBe(true);
  expect(res.value.an_tor).toBe(TORE[0]);
});

test('совсем пустая заявка не принимается', () => {
  // Иначе экспонент видит «отправлено», а Messeleitung получает пустую строку
  // и ни одного факта.
  const res = validateLogistik({});
  expect(res.ok).toBe(false);
  expect(res.error).toContain('Angabe');
});

test('ноль парковочных карт без остального — тоже пустая заявка', () => {
  expect(validateLogistik({ parkkarten: 0 }).ok).toBe(false);
});

test('парковочные карты сами по себе — заявка', () => {
  const res = validateLogistik({ parkkarten: 3 });
  expect(res.ok).toBe(true);
  expect(res.value.parkkarten).toBe(3);
});

test('чужие ворота и чужой транспорт отбрасываются, а не сохраняются', () => {
  const res = validateLogistik({
    an_tor: 'Hintereingang',
    an_fahrzeug: 'Helikopter',
    parkkarten: 1,
  });
  expect(res.ok).toBe(true);
  expect(res.value.an_tor).toBe('');
  expect(res.value.an_fahrzeug).toBe('');
});

test('известный транспорт проходит как есть', () => {
  const res = validateLogistik({ an_fahrzeug: FAHRZEUGE[2] });
  expect(res.value.an_fahrzeug).toBe(FAHRZEUGE[2]);
});

test('нечисловое количество карт — ошибка, а не молчаливый ноль', () => {
  expect(validateLogistik({ parkkarten: 'viele' }).ok).toBe(false);
});

test('отрицательное количество карт не принимается', () => {
  expect(validateLogistik({ parkkarten: -2 }).ok).toBe(false);
});

test('верхняя граница карт защищает от опечатки', () => {
  expect(validateLogistik({ parkkarten: MAX_PARKKARTEN }).ok).toBe(true);
  expect(validateLogistik({ parkkarten: MAX_PARKKARTEN + 1 }).ok).toBe(false);
});

test('дробное количество карт округляется вниз, а не роняет заявку', () => {
  expect(validateLogistik({ parkkarten: 2.7 }).value.parkkarten).toBe(2);
});

test('пустая строка в количестве — это ноль, а не ошибка', () => {
  // Поле со стрелочками легко очистить целиком; ругаться тут не за что.
  expect(validateLogistik({ parkkarten: '', an_tor: TORE[1] }).ok).toBe(true);
});
