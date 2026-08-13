import { test, expect } from '@playwright/test';
import { KATEGORIEN, ZONEN, parseMarken, validateAnfrage } from '../../lib/anfrage';

/**
 * Unit: заявка на площадь с витрины.
 *
 * Раньше эта проверка жила внутри роута и тестами покрыта не была — то есть
 * единственная форма, приносящая деньги, проверялась только руками.
 */

const GUELTIG = {
  firma: 'Rokker AG',
  name: 'Anna Muster',
  email: 'a.muster@rokker.example',
  consent: true,
  elapsed_ms: 9000,
};

test('минимальная заявка проходит', () => {
  const res = validateAnfrage(GUELTIG);
  expect(res.ok).toBe(true);
  expect(res.value.firma).toBe('Rokker AG');
});

test('обязательны только компания, контакт, почта и согласие', () => {
  // Каждое лишнее обязательное поле стоит части лидов. Остальное спросим
  // по телефону.
  const res = validateAnfrage(GUELTIG);
  expect(res.value.kategorie).toBe(null);
  expect(res.value.zone).toBe(null);
  expect(res.value.marken).toEqual([]);
});

test('без компании или контакта не принимаем', () => {
  expect(validateAnfrage({ ...GUELTIG, firma: '' }).ok).toBe(false);
  expect(validateAnfrage({ ...GUELTIG, name: '  ' }).ok).toBe(false);
});

test('без согласия заявку не сохраняем вовсе', () => {
  expect(validateAnfrage({ ...GUELTIG, consent: false }).ok).toBe(false);
});

test('категория и зона принимаются только из списков', () => {
  expect(validateAnfrage({ ...GUELTIG, kategorie: KATEGORIEN[0] }).ok).toBe(true);
  expect(validateAnfrage({ ...GUELTIG, zone: ZONEN[0] }).ok).toBe(true);

  expect(validateAnfrage({ ...GUELTIG, kategorie: 'Alles Mögliche' }).ok).toBe(false);
  expect(validateAnfrage({ ...GUELTIG, zone: 'Hinterhof' }).ok).toBe(false);
});

test('категория берётся из того же списка, что в кабинете', () => {
  // Второй список означал бы, что заявка и профиль компании говорят
  // о разных категориях.
  expect(KATEGORIEN).toContain('Motorräder & Importeure');
});

test('бренды разбираются из строки, как их и вводят', () => {
  expect(parseMarken('Triumph, Rokker; Held')).toEqual(['Triumph', 'Rokker', 'Held']);
  expect(parseMarken('Triumph\nRokker')).toEqual(['Triumph', 'Rokker']);
});

test('повторы брендов схлопываются без учёта регистра', () => {
  expect(parseMarken('Triumph, triumph, TRIUMPH')).toEqual(['Triumph']);
});

test('пустые куски между запятыми выбрасываются', () => {
  expect(parseMarken('Triumph,,  ,Rokker')).toEqual(['Triumph', 'Rokker']);
  expect(parseMarken('')).toEqual([]);
  expect(parseMarken(null)).toEqual([]);
});

test('список брендов не растёт бесконечно', () => {
  const viele = Array.from({ length: 100 }, (_, i) => `Marke${i}`).join(',');
  expect(parseMarken(viele).length).toBe(30);
});

test('согласие на новости отдельное', () => {
  expect(validateAnfrage(GUELTIG).value.marketing_consent).toBe(false);
  expect(validateAnfrage({ ...GUELTIG, marketing_consent: true }).value.marketing_consent).toBe(true);
});

test('ловушка и скорость отсекают ботов молча', () => {
  expect(validateAnfrage({ ...GUELTIG, website: 'spam' }).bot).toBe(true);
  expect(validateAnfrage({ ...GUELTIG, elapsed_ms: 100 }).bot).toBe(true);
});

test('заявка без площадки допустима — площадку подберут в разговоре', () => {
  // Зал ещё не размечен, а покупатель приходит тогда, когда приходит.
  const res = validateAnfrage({ ...GUELTIG, zone: 'noch offen' });
  expect(res.ok).toBe(true);
  expect(res.value.zone).toBe('noch offen');
});
