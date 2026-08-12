import { test, expect } from '@playwright/test';
import { describeEnv, REQUIRED_VARS } from '../../lib/env';

/**
 * Unit: чистая функция describeEnv — ей передают объект env, а не читают
 * process.env внутри. Поэтому кейсы можно задать любые, включая те, которые
 * на машине разработчика не воспроизвести.
 *
 * Отдельно проверяем, что значения переменных наружу не утекают: health-роут
 * отдаёт результат этой функции в открытый эндпоинт.
 */

const FULL = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'secret-service-role-key',
  RESEND_API_KEY: 're_secret',
  PORTAL_FROM_EMAIL: 'MOTO-ZÜRICH <noreply@motozuerich.ch>',
  PORTAL_REPLY_TO: 'yves@motozuerich.ch',
  PUBLIC_BASE_URL: 'https://ausstellerportal.motozuerich.ch',
};

test('всё задано → ok, списки отсутствующих пустые', () => {
  const r = describeEnv(FULL);
  expect(r.ok).toBe(true);
  expect(r.missingRequired).toEqual([]);
  expect(r.missingOptional).toEqual([]);
});

test('нет обязательной переменной → не ok, она названа', () => {
  const { SUPABASE_SERVICE_ROLE_KEY, ...withoutKey } = FULL;
  const r = describeEnv(withoutKey);
  expect(r.ok).toBe(false);
  expect(r.missingRequired).toEqual(['SUPABASE_SERVICE_ROLE_KEY']);
});

test('пустая строка и пробелы считаются «не задано»', () => {
  // На платформе уже был инцидент: переменная существовала, но была пустой,
  // и код считал её заданной. Здесь это должно трактоваться как отсутствие.
  const r = describeEnv({ ...FULL, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '   ' });
  expect(r.ok).toBe(false);
  expect(r.missingRequired).toEqual(REQUIRED_VARS);
});

test('пустой env → перечислены все обязательные', () => {
  const r = describeEnv({});
  expect(r.ok).toBe(false);
  expect(r.missingRequired).toEqual(REQUIRED_VARS);
});

test('вызов без аргумента не падает', () => {
  expect(() => describeEnv()).not.toThrow();
});

test('в результат не попадают значения переменных', () => {
  const serialized = JSON.stringify(describeEnv(FULL));
  expect(serialized).not.toContain('secret-service-role-key');
  expect(serialized).not.toContain('re_secret');
  expect(serialized).not.toContain('example.supabase.co');
});

test('без переопределений почты список пуст', () => {
  expect(describeEnv(FULL).aktiveUmleitungen).toEqual([]);
});

test('включённое переопределение почты названо', () => {
  // Забытый в Production PORTAL_MAIL_OVERRIDE уводит письма всех экспонентов
  // в тестовый ящик, и узнаём мы об этом последними: жаловаться некому,
  // человек просто не получает код входа.
  const r = describeEnv({ ...FULL, PORTAL_MAIL_OVERRIDE: 'tests@example.invalid' });
  expect(r.aktiveUmleitungen).toEqual(['PORTAL_MAIL_OVERRIDE']);
  // Это не поломка конфигурации: ok остаётся true, решает человек.
  expect(r.ok).toBe(true);
});

test('оба переопределения видны одновременно', () => {
  const r = describeEnv({
    ...FULL,
    PORTAL_MAIL_OVERRIDE: 'tests@example.invalid',
    PORTAL_NOTIFY_EMAIL: 'assistant@creox.ch',
  });
  expect(r.aktiveUmleitungen).toEqual(['PORTAL_MAIL_OVERRIDE', 'PORTAL_NOTIFY_EMAIL']);
});

test('адрес переопределения наружу не отдаётся', () => {
  // Адрес получателя — тоже чужие данные, а health открыт без сессии.
  const serialized = JSON.stringify(
    describeEnv({ ...FULL, PORTAL_NOTIFY_EMAIL: 'assistant@creox.ch' })
  );
  expect(serialized).toContain('PORTAL_NOTIFY_EMAIL');
  expect(serialized).not.toContain('assistant@creox.ch');
});

test('пустое переопределение не считается включённым', () => {
  expect(describeEnv({ ...FULL, PORTAL_MAIL_OVERRIDE: '  ' }).aktiveUmleitungen).toEqual([]);
});
