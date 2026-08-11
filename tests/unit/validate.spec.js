import { test, expect } from '@playwright/test';
import { isEmail, isLoginCode, normalizeEmail, normalizeLoginCode } from '../../lib/validate';

/**
 * Unit: проверка ввода на входе.
 *
 * Ключевое требование, ради которого это отдельный модуль: адрес из формы
 * должен приводиться к тому же виду, к которому триггер приводит строки
 * в mz_allowlist. Иначе допущенный человек не найдёт себя в списке.
 */

test('адрес приводится к нижнему регистру и без пробелов', () => {
  expect(normalizeEmail('  Firma@Example.CH  ')).toBe('firma@example.ch');
});

test('нестрока превращается в пустую строку, а не падает', () => {
  expect(normalizeEmail(undefined)).toBe('');
  expect(normalizeEmail(null)).toBe('');
  expect(normalizeEmail(42)).toBe('');
});

test('нормальные адреса проходят', () => {
  for (const ok of ['firma@example.ch', 'a.b-c+d@sub.domain.co.uk', 'YVES@motozuerich.ch']) {
    expect(isEmail(ok), ok).toBe(true);
  }
});

test('мусор не проходит', () => {
  for (const bad of [
    '',
    'firma',
    'firma@',
    '@example.ch',
    'firma@example',       // нет точки в домене
    'firma@.ch',
    'firma@example..ch',
    'fir ma@example.ch',   // пробел внутри
    'a@b.c@d.ch',          // две собаки
    undefined,
    null,
  ]) {
    expect(isEmail(bad), String(bad)).toBe(false);
  }
});

test('код входа: цифры, длина не зашита', () => {
  // Длина кода — настройка Supabase. Наш проект выдаёт восьмизначный,
  // документация обещает шестизначный. Проверка не должна отбивать вход
  // из-за того, что настройку поменяли: настоящая сверка идёт в verifyOtp.
  expect(isLoginCode('123456')).toBe(true);
  expect(isLoginCode('12345678')).toBe(true);
  expect(isLoginCode('1234')).toBe(true);
});

test('код входа: мусор отбивается', () => {
  expect(isLoginCode('12345a')).toBe(false);
  expect(isLoginCode('123')).toBe(false);
  expect(isLoginCode('1234567890123')).toBe(false);
  expect(isLoginCode('')).toBe(false);
  expect(isLoginCode(123456)).toBe(false);
});

test('код чистится от пробелов — его копируют из письма', () => {
  // «123 456» из письма или с пробелом в конце не должно быть поводом
  // сказать человеку, что код неверный.
  expect(normalizeLoginCode(' 123 456 ')).toBe('123456');
  expect(isLoginCode(normalizeLoginCode('123 456'))).toBe(true);
});
