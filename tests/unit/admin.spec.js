import { test, expect } from '@playwright/test';
import {
  validateAnfrageUpdate,
  validateNewCompany,
  validateStandUpdate,
  validateZugang,
} from '../../lib/admin';

/**
 * Unit: правила операций Messeleitung.
 *
 * Смысл админки — снять конкретный риск: доступ выдавался вставкой строки
 * с идентификатором компании, скопированным глазами, и опечатка в нём
 * пускала человека в кабинет чужой компании. Здесь последний рубеж на
 * случай запроса мимо формы.
 */

const FIRMA_ID = '11111111-2222-3333-4444-555555555555';

test('новая компания: нужно только название', () => {
  expect(validateNewCompany({ name: 'Muster AG' }).ok).toBe(true);
  expect(validateNewCompany({ name: '   ' }).ok).toBe(false);
});

test('новая компания: неизвестный статус отбивается', () => {
  expect(validateNewCompany({ name: 'Muster AG', status: 'выдумано' }).ok).toBe(false);
  expect(validateNewCompany({ name: 'Muster AG', status: 'angemeldet' }).ok).toBe(true);
});

test('новая компания: кривая почта не записывается, но и не валит создание', () => {
  // Почта тут второстепенна: компанию заводят, чтобы дать доступ, а не ради почты.
  const r = validateNewCompany({ name: 'Muster AG', rechnungs_email: 'не-почта' });
  expect(r.ok).toBe(true);
  expect(r.value.rechnungs_email).toBe('');
});

test('доступ: почта и компания обязательны', () => {
  expect(validateZugang({ email: 'a@firma.ch', company_id: FIRMA_ID }).ok).toBe(true);
  expect(validateZugang({ email: 'не-почта', company_id: FIRMA_ID }).ok).toBe(false);
  expect(validateZugang({ email: 'a@firma.ch' }).ok).toBe(false);
});

test('доступ: обрывок идентификатора компании не проходит', () => {
  // Ровно тот случай, ради которого админка и делалась: раньше сюда
  // попадало то, что скопировалось.
  const r = validateZugang({ email: 'a@firma.ch', company_id: '1111-2222' });
  expect(r.ok).toBe(false);
  expect(r.error).toContain('Firma');
});

test('доступ: почта приводится к нижнему регистру', () => {
  const r = validateZugang({ email: '  Firma@Example.CH ', company_id: FIRMA_ID });
  expect(r.value.email).toBe('firma@example.ch');
});

test('площадка: «vergeben» без компании не сохранить', () => {
  // Иначе на плане место выглядит занятым, а кем — неизвестно.
  const r = validateStandUpdate({ status: 'vergeben' });
  expect(r.ok).toBe(false);
  expect(r.error).toContain('Firma');
});

test('площадка: «frei» с компанией не сохранить', () => {
  // Иначе площадка остаётся привязанной, и следующий заказ уедет не туда.
  const r = validateStandUpdate({ status: 'frei', company_id: FIRMA_ID });
  expect(r.ok).toBe(false);
});

test('площадка: освобождение сбрасывает компанию', () => {
  const r = validateStandUpdate({ status: 'frei' });
  expect(r.ok).toBe(true);
  expect(r.value.company_id).toBeNull();
});

test('площадка: «reserviert» допускается и с компанией, и без', () => {
  // Забронировано по звонку — компании может ещё не быть в базе.
  expect(validateStandUpdate({ status: 'reserviert' }).ok).toBe(true);
  expect(validateStandUpdate({ status: 'reserviert', company_id: FIRMA_ID }).ok).toBe(true);
});

test('площадка: неизвестный статус отбивается', () => {
  expect(validateStandUpdate({ status: 'продано' }).ok).toBe(false);
});

test('заявка: только известные статусы', () => {
  expect(validateAnfrageUpdate({ status: 'gewonnen' }).ok).toBe(true);
  expect(validateAnfrageUpdate({ status: 'выдумано' }).ok).toBe(false);
});
