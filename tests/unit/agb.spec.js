import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { AGB_PUNKTE, AGB_VERSION } from '../../lib/agb';

/**
 * Unit: приём Ausstellungsbedingungen.
 *
 * Здесь защищается не поведение кода, а условие действительности акцепта.
 * Экспонент этой галочкой заключает договор: текст Ксении объявляет
 * электронное согласие равным собственноручной подписи и отменяет бумажные
 * договоры. Значит цена ошибки — не «кнопка не работает», а «договор
 * оспорим».
 *
 * Отсюда три инварианта: галочек ровно четыре и ни одна не проставлена
 * заранее; версия видна человеку в момент согласия; форма не отправляется,
 * пока отмечено не всё.
 */

const KOMPONENTE = join(process.cwd(), 'app', 'portal', 'agb-akzeptanz.jsx');
const quelle = readFileSync(KOMPONENTE, 'utf8');

test('четыре пункта — столько же, сколько проверяет роут', () => {
  // Роут отбивает всё, где punkte.length !== 4. Разъедутся — акцепт
  // перестанет проходить вовсе, и виноват будет не тот файл.
  expect(AGB_PUNKTE).toHaveLength(4);
  expect(AGB_PUNKTE.every((p) => typeof p === 'string' && p.length > 40)).toBe(true);
});

test('версия названа человеку прямо в тексте согласия', () => {
  // Согласие «с условиями» без указания редакции доказывает мало: через
  // месяц текст поменяется, а в базе останется галочка без привязки.
  expect(AGB_PUNKTE[0]).toContain(AGB_VERSION);
  expect(AGB_VERSION).toMatch(/^\d+\.\d+$/);
});

test('ни одна галочка не проставлена заранее', () => {
  // Предзаполненное согласие согласием не является. Проверяем стартовое
  // состояние в исходнике: через браузер сюда не попасть — страница
  // за сессией, а тест на пустой сессии до неё не доходит.
  expect(quelle).toMatch(/useState\(\s*\[\s*false\s*,\s*false\s*,\s*false\s*,\s*false\s*\]\s*\)/);
  expect(quelle).not.toMatch(/defaultChecked/);
  expect(quelle).not.toMatch(/checked=\{\s*true\s*\}/);
});

test('кнопка заблокирована, пока отмечено не всё', () => {
  // Вторая линия к проверке на сервере: без неё человек жмёт «Verbindlich
  // anmelden», получает отказ и не понимает, чего от него хотят.
  expect(quelle).toMatch(/alleAngeklickt\s*=\s*checked\.every\(Boolean\)/);
  expect(quelle).toMatch(/disabled=\{[^}]*!alleAngeklickt/);
});

test('согласие отправляется целиком, а не по одной галочке', () => {
  // punkte: checked — весь массив. Отправка «сколько успел» дала бы
  // в базе акцепт, которого человек не давал.
  expect(quelle).toMatch(/punkte:\s*checked/);
});
