import { test, expect } from '@playwright/test';
import { SLOTS, sanitizeFilename, storagePath, validateUpload } from '../../lib/storage';

/**
 * Unit: правила загрузки файлов.
 *
 * Имя файла приходит из браузера и является недоверенными данными. Проверка
 * размера и типа тоже серверная: атрибут accept в разметке — подсказка
 * человеку, а не защита, запрос можно отправить мимо формы.
 */

const OK = { size: 100_000, type: 'image/png' };

test('нормальный логотип проходит', () => {
  expect(validateUpload(OK, 'logo').ok).toBe(true);
  expect(validateUpload({ size: 1000, type: 'image/jpeg' }, 'logo').ok).toBe(true);
  expect(validateUpload({ size: 1000, type: 'image/webp' }, 'logo').ok).toBe(true);
});

test('регистр типа не мешает', () => {
  expect(validateUpload({ size: 1000, type: 'IMAGE/PNG' }, 'logo').ok).toBe(true);
});

test('слишком большой файл отбивается с понятным текстом', () => {
  const r = validateUpload({ size: SLOTS.logo.maxBytes + 1, type: 'image/png' }, 'logo');
  expect(r.ok).toBe(false);
  expect(r.error).toContain('MB');
});

test('пустой файл отбивается', () => {
  expect(validateUpload({ size: 0, type: 'image/png' }, 'logo').ok).toBe(false);
});

test('SVG не принимается — внутри может быть скрипт', () => {
  // Логотип попадает на сайт и в приложение; исполняемое содержимое там
  // недопустимо. Для печати макет приходит отдельным каналом.
  const r = validateUpload({ size: 1000, type: 'image/svg+xml' }, 'logo');
  expect(r.ok).toBe(false);
});

test('чужие форматы не принимаются', () => {
  for (const type of ['application/pdf', 'text/html', 'application/x-msdownload', '']) {
    expect(validateUpload({ size: 1000, type }, 'logo').ok, type).toBe(false);
  }
});

test('неизвестный слот отбивается, а не проходит по умолчанию', () => {
  expect(validateUpload(OK, 'выдуманный').ok).toBe(false);
});

test('имя файла чистится от опасного', () => {
  expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
  expect(sanitizeFilename('C:\\Windows\\logo.png')).toBe('logo.png');
  expect(sanitizeFilename('.htaccess')).toBe('htaccess');
});

test('имя из чужого алфавита не превращается в пустоту или мусор', () => {
  // Кириллица и умляуты вычищаются, и это нормально: имя файла нигде не
  // показывается, уникальность даёт префикс. Важно другое — результат должен
  // остаться непустым и сохранить расширение. Проверяем требование,
  // а не конкретную строку: она зависит от набора разрешённых символов.
  const cyr = sanitizeFilename('логотип фирмы.PNG');
  expect(cyr.endsWith('.png')).toBe(true);
  expect(cyr.replace('.png', '').length).toBeGreaterThan(0);

  const umlaut = sanitizeFilename('Logo Müller.jpg');
  expect(umlaut.endsWith('.jpg')).toBe(true);
  expect(umlaut).toMatch(/^[a-zA-Z0-9._-]+$/);
});

test('пустое имя не оставляет файл без имени', () => {
  expect(sanitizeFilename('')).toBe('datei');
  expect(sanitizeFilename(null)).toBe('datei');
});

test('путь всегда начинается с идентификатора компании', () => {
  // Ключевая защита: чужой файл нельзя отдать по ошибке — несовпадение
  // префикса видно сразу.
  const p = storagePath('abc-123', 'logo', '../../evil.png', 'deadbeef');
  expect(p.startsWith('abc-123/logo/')).toBe(true);
  expect(p).not.toContain('..');
});

test('одинаковые имена не затирают друг друга', () => {
  const a = storagePath('abc', 'logo', 'logo.png', '11111111');
  const b = storagePath('abc', 'logo', 'logo.png', '22222222');
  expect(a).not.toBe(b);
});
