import { test, expect } from '@playwright/test';
import { MIN_FILL_MS, validateFreischaltung } from '../../lib/preisgate';

/**
 * Unit: обмен контакта на показ цен.
 *
 * Проверяется то, от чего зависит качество списка лидов и законность
 * дальнейшей переписки.
 */

const GUELTIG = {
  email: 'einkauf@hostettler.example',
  firma: 'Hostettler Moto AG',
  consent: true,
  elapsed_ms: 9000,
};

test('нормальный запрос проходит', () => {
  const res = validateFreischaltung(GUELTIG);
  expect(res.ok).toBe(true);
  expect(res.value.email).toBe('einkauf@hostettler.example');
  expect(res.value.firma).toBe('Hostettler Moto AG');
});

test('без согласия цены не показываем', () => {
  const res = validateFreischaltung({ ...GUELTIG, consent: false });
  expect(res.ok).toBe(false);
  expect(res.bot).toBeUndefined();
});

test('без компании не пускаем — в B2B адрес без фирмы бесполезен', () => {
  const res = validateFreischaltung({ ...GUELTIG, firma: '  ' });
  expect(res.ok).toBe(false);
  expect(res.error).toContain('Firma');
});

test('мусор вместо почты отклоняется', () => {
  expect(validateFreischaltung({ ...GUELTIG, email: 'нет-собаки' }).ok).toBe(false);
  expect(validateFreischaltung({ ...GUELTIG, email: '' }).ok).toBe(false);
});

test('почта приводится к нижнему регистру — иначе дедупликация не сработает', () => {
  const res = validateFreischaltung({ ...GUELTIG, email: '  Einkauf@Hostettler.Example ' });
  expect(res.value.email).toBe('einkauf@hostettler.example');
});

test('согласие на новости отдельное и по умолчанию выключено', () => {
  // Разные вещи: «покажите цену» не даёт права слать маркетинг.
  expect(validateFreischaltung(GUELTIG).value.marketing_consent).toBe(false);
  expect(
    validateFreischaltung({ ...GUELTIG, marketing_consent: true }).value.marketing_consent
  ).toBe(true);
});

test('отсутствие согласия на новости не мешает показать цену', () => {
  expect(validateFreischaltung({ ...GUELTIG, marketing_consent: false }).ok).toBe(true);
});

test('заполненная ловушка — бот, и он не должен понять, что раскрыт', () => {
  const res = validateFreischaltung({ ...GUELTIG, website: 'http://spam' });
  expect(res.ok).toBe(false);
  expect(res.bot).toBe(true);
  expect(res.error).toBeUndefined();
});

test('слишком быстрое заполнение — бот', () => {
  const res = validateFreischaltung({ ...GUELTIG, elapsed_ms: MIN_FILL_MS - 1 });
  expect(res.bot).toBe(true);
});

test('ловушка проверяется раньше полей', () => {
  // Иначе по тексту ошибки скрипт узнает, что именно поправить.
  const res = validateFreischaltung({ website: 'spam', email: 'мусор', consent: false });
  expect(res.bot).toBe(true);
});

test('без времени заполнения запрос не отвергается', () => {
  // Не у всех браузеров сработает замер; отсутствие данных не улика.
  const { elapsed_ms, ...ohneZeit } = GUELTIG;
  expect(validateFreischaltung(ohneZeit).ok).toBe(true);
});
