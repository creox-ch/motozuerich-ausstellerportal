import { test, expect } from '@playwright/test';
import { formatBetrag, parseBetragRappen, validateDokument } from '../../lib/dokumente';

/**
 * Unit: правила документов и счетов.
 *
 * Проверяется то, что решает судьбу денег и доступа: во что превращается
 * введённая сумма и можно ли выставить счёт «всем».
 */

const FIRMA = '11111111-2222-3333-4444-555555555555';

test('сумма в раппенах, а не во франках', () => {
  expect(parseBetragRappen('1250.00')).toEqual({ ok: true, value: 125000 });
});

test('копейки не теряются на двоичной арифметике', () => {
  // 19.99 * 100 в двоичной арифметике даёт 1998.9999999999998.
  // Усечение превратило бы счёт на 19.99 в счёт на 19.98.
  expect(parseBetragRappen('19.99')).toEqual({ ok: true, value: 1999 });
  expect(parseBetragRappen('0.07')).toEqual({ ok: true, value: 7 });
});

test('сумму принимаем в том виде, в каком её пишут в счёте', () => {
  expect(parseBetragRappen("1’250.50")).toEqual({ ok: true, value: 125050 });
  expect(parseBetragRappen('1250,50')).toEqual({ ok: true, value: 125050 });
  expect(parseBetragRappen(' 1250.50 ')).toEqual({ ok: true, value: 125050 });
});

test('пустая сумма — это отсутствие суммы, а не ноль', () => {
  // Ноль означал бы «счёт на 0.00 CHF» и показался бы экспоненту как сумма.
  expect(parseBetragRappen('')).toEqual({ ok: true, value: null });
  expect(parseBetragRappen(null)).toEqual({ ok: true, value: null });
});

test('мусор вместо суммы отклоняется, а не превращается в NaN', () => {
  expect(parseBetragRappen('viel').ok).toBe(false);
  expect(parseBetragRappen('12.345').ok).toBe(false);
  expect(parseBetragRappen('-50').ok).toBe(false);
});

test('сумма показывается по-швейцарски', () => {
  expect(formatBetrag(125000)).toBe('CHF 1’250.00');
  expect(formatBetrag(1999)).toBe('CHF 19.99');
  expect(formatBetrag(123456789)).toBe('CHF 1’234’567.89');
});

test('нет суммы — нечего показывать', () => {
  expect(formatBetrag(null)).toBe(null);
  expect(formatBetrag(undefined)).toBe(null);
  expect(formatBetrag('kein Geld')).toBe(null);
});

test('счёт без компании не заводится', () => {
  // Строка без компании видна каждому, кто откроет раздел: счёт одной фирмы
  // ушёл бы всем участникам выставки.
  const res = validateDokument({ titel: 'Rechnung Technik', art: 'rechnung' });
  expect(res.ok).toBe(false);
  expect(res.error).toContain('Firma');
});

test('счёт с компанией заводится и сумма доезжает в раппенах', () => {
  const res = validateDokument({
    titel: 'Rechnung Technik',
    art: 'rechnung',
    company_id: FIRMA,
    betrag: '1250.00',
    faellig_am: '2027-01-15',
  });
  expect(res.ok).toBe(true);
  expect(res.value).toEqual({
    titel: 'Rechnung Technik',
    art: 'rechnung',
    company_id: FIRMA,
    betrag_rappen: 125000,
    faellig_am: '2027-01-15',
  });
});

test('документ без компании — общий для всех, это нормально', () => {
  const res = validateDokument({ titel: 'Technisches Merkblatt' });
  expect(res.ok).toBe(true);
  expect(res.value.company_id).toBe(null);
  expect(res.value.art).toBe('dokument');
});

test('сумма у обычного документа — это ошибка выбора типа, а не мелочь', () => {
  // Молча отбросить сумму значило бы потерять введённое человеком без
  // объяснения: он бы решил, что счёт выставлен.
  const res = validateDokument({ titel: 'AGB', betrag: '99.00' });
  expect(res.ok).toBe(false);
  expect(res.error).toContain('Rechnungen');
});

test('без названия документ не заводится', () => {
  expect(validateDokument({ titel: '  ' }).ok).toBe(false);
});

test('неизвестный тип отклоняется', () => {
  expect(validateDokument({ titel: 'X', art: 'vertrag' }).ok).toBe(false);
});

test('подставленный вместо идентификатора мусор не проходит', () => {
  const res = validateDokument({ titel: 'X', art: 'rechnung', company_id: 'oder-1=1' });
  expect(res.ok).toBe(false);
});

test('срок оплаты принимается только в машинном формате', () => {
  const res = validateDokument({
    titel: 'R',
    art: 'rechnung',
    company_id: FIRMA,
    faellig_am: '15.01.2027',
  });
  expect(res.ok).toBe(false);
});
