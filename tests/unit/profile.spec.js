import { test, expect } from '@playwright/test';
import {
  KATEGORIEN,
  MAX_BESCHREIBUNG,
  formatBrands,
  parseBrands,
  validateProfile,
} from '../../lib/profile';

/**
 * Unit: правила профиля компании.
 *
 * Эти же правила применяет роут перед записью — проверка только в форме
 * не защищает ничего, запрос можно отправить мимо неё.
 */

const MINIMAL = { name: 'Testfirma AG' };

test('название обязательно, если его прислали', () => {
  const r = validateProfile({ name: '   ' });
  expect(r.ok).toBe(false);
  expect(r.errors.name).toBeTruthy();
});

test('в запись попадают ТОЛЬКО присланные поля', () => {
  // Регрессия, найденная живой проверкой: раньше функция возвращала все поля
  // с пустыми значениями по умолчанию, и сохранение двух полей обнуляло
  // категорию, марки, сайт и адреса. Форма шлёт всё сразу, поэтому в
  // интерфейсе это было незаметно — и тем опаснее.
  const r = validateProfile({ name: 'Testfirma AG' });
  expect(r.ok).toBe(true);
  expect(Object.keys(r.value)).toEqual(['name']);
  expect('kategorie' in r.value).toBe(false);
  expect('brands' in r.value).toBe(false);
  expect('website' in r.value).toBe(false);
});

test('пустая строка — это осознанная очистка поля, а не отсутствие', () => {
  // Человек стёр текст в форме и сохранил: поле должно очиститься.
  const r = validateProfile({ beschreibung: '' });
  expect(r.ok).toBe(true);
  expect(r.value.beschreibung).toBe('');
});

test('запрос без единого известного поля → ошибка, а не пустое обновление', () => {
  const r = validateProfile({ id: 'что-то', status: 'bestaetigt' });
  expect(r.ok).toBe(false);
  expect(r.errors._).toBeTruthy();
});

test('одного названия достаточно — профиль заполняют постепенно', () => {
  // Требовать всё сразу означало бы, что человек не может сохранить
  // наполовину заполненную форму и потерял бы введённое.
  const r = validateProfile(MINIMAL);
  expect(r.ok).toBe(true);
  expect(r.errors).toEqual({});
});

test('описание длиннее лимита отбивается', () => {
  const r = validateProfile({ ...MINIMAL, beschreibung: 'x'.repeat(MAX_BESCHREIBUNG + 1) });
  expect(r.ok).toBe(false);
  expect(r.errors.beschreibung).toContain(String(MAX_BESCHREIBUNG));
});

test('описание ровно по лимиту проходит', () => {
  const r = validateProfile({ ...MINIMAL, beschreibung: 'x'.repeat(MAX_BESCHREIBUNG) });
  expect(r.ok).toBe(true);
});

test('категория только из списка каталога', () => {
  expect(validateProfile({ ...MINIMAL, kategorie: KATEGORIEN[0] }).ok).toBe(true);
  expect(validateProfile({ ...MINIMAL, kategorie: '' }).ok).toBe(true);
  const bad = validateProfile({ ...MINIMAL, kategorie: 'Ракеты' });
  expect(bad.ok).toBe(false);
  expect(bad.errors.kategorie).toBeTruthy();
});

test('адреса проверяются и приводятся к нижнему регистру', () => {
  const r = validateProfile({ ...MINIMAL, rechnungs_email: '  Buchhaltung@Firma.CH ' });
  expect(r.ok).toBe(true);
  expect(r.value.rechnungs_email).toBe('buchhaltung@firma.ch');

  expect(validateProfile({ ...MINIMAL, public_email: 'нет-собаки' }).ok).toBe(false);
});

test('сайт требует протокол', () => {
  expect(validateProfile({ ...MINIMAL, website: 'https://firma.ch' }).ok).toBe(true);
  expect(validateProfile({ ...MINIMAL, website: 'firma.ch' }).ok).toBe(false);
});

test('инстаграм принимается и с собакой, и без', () => {
  // Люди присылают и «@motozuerich», и ссылку. Отбивать за это неправильно.
  expect(validateProfile({ ...MINIMAL, instagram: '@motozuerich' }).value.instagram).toBe('motozuerich');
  expect(validateProfile({ ...MINIMAL, instagram: 'motozuerich' }).ok).toBe(true);
  expect(validateProfile({ ...MINIMAL, instagram: 'https://instagram.com/motozuerich' }).ok).toBe(true);
});

test('марки: разбор, чистка пустых и дублей', () => {
  expect(parseBrands('BMW, Ducati , , Honda')).toEqual(['BMW', 'Ducati', 'Honda']);
  expect(parseBrands('BMW, bmw')).toEqual(['BMW']);
  expect(parseBrands('')).toEqual([]);
  expect(parseBrands(['BMW', ' Honda '])).toEqual(['BMW', 'Honda']);
});

test('марки собираются обратно в строку для формы', () => {
  expect(formatBrands(['BMW', 'Honda'])).toBe('BMW, Honda');
  expect(formatBrands(null)).toBe('');
});

test('лишние поля из тела запроса не проходят в запись', () => {
  // Ключевая защита: клиент присылает id компании или статус — они не должны
  // попасть в обновление. Компания определяется сессией, статус ставим мы.
  // Проверено и вживую: попытка переписать чужую компанию подстановкой её id
  // не тронула чужие данные.
  const r = validateProfile({
    ...MINIMAL,
    id: 'чужой-id',
    status: 'bestaetigt',
    logo_path: 'что-то',
    created_at: '2020-01-01',
  });
  expect(r.ok).toBe(true);
  expect(r.value.id).toBeUndefined();
  expect(r.value.status).toBeUndefined();
  expect(r.value.logo_path).toBeUndefined();
  expect(r.value.created_at).toBeUndefined();
});
