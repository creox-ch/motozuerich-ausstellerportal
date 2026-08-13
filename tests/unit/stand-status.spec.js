import { test, expect } from '@playwright/test';
import {
  EIGENE_FARBE,
  STATUS_FARBE,
  STATUS_TEXT,
  statusFarbe,
  statusText,
} from '../../lib/stand-status';

/**
 * Unit: цвета статусов площадок.
 *
 * Цвет здесь несёт смысл — «можно взять» или «занято». Прежняя палитра была
 * из четырёх почти белых оттенков, и разницу было видно, только положив их
 * рядом. Эти проверки держат два свойства: цвета различимы между собой
 * и подпись поверх них остаётся читаемой.
 */

/** Относительная яркость по WCAG. */
function leuchtdichte(hex) {
  const kanal = (n) => {
    const c = n / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

function kontrast(a, b) {
  const [hell, dunkel] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x);
  return (hell + 0.05) / (dunkel + 0.05);
}

/** Цвет, которым на плане печатается номер площадки. */
const BESCHRIFTUNG = '#12253F';

test('у каждого статуса есть подпись и цвет', () => {
  for (const status of Object.keys(STATUS_TEXT)) {
    expect(STATUS_FARBE[status], status).toBeDefined();
  }
  expect(Object.keys(STATUS_FARBE).sort()).toEqual(Object.keys(STATUS_TEXT).sort());
});

test('номер площадки читается на любой заливке', () => {
  // Отсюда и потолок яркости: затемнить фон «поярче» нельзя, подпись пропадёт.
  for (const [status, farbe] of Object.entries(STATUS_FARBE)) {
    expect(kontrast(farbe, BESCHRIFTUNG), `${status} (${farbe})`).toBeGreaterThanOrEqual(4.5);
  }
  expect(kontrast(EIGENE_FARBE, BESCHRIFTUNG)).toBeGreaterThanOrEqual(4.5);
});

test('статусы различимы между собой, а не «четыре белых»', () => {
  // Именно эта проверка краснеет, если палитру снова разбавят до пастели.
  const farben = Object.entries(STATUS_FARBE);
  for (let i = 0; i < farben.length; i++) {
    for (let j = i + 1; j < farben.length; j++) {
      const [a, farbeA] = farben[i];
      const [b, farbeB] = farben[j];
      expect(kontrast(farbeA, farbeB), `${a} ↔ ${b}`).toBeGreaterThan(1.25);
    }
  }
});

test('свободное отличается от занятого заметнее всего', () => {
  // Эти два статуса человек различает чаще прочих: он ищет, что можно взять.
  expect(kontrast(STATUS_FARBE.frei, STATUS_FARBE.vergeben)).toBeGreaterThan(1.4);
});

test('своя площадка в кабинете не сливается с «зарезервировано»', () => {
  // Обе тёплые: жёлтая своя и оранжевый резерв. Разница должна остаться.
  expect(kontrast(EIGENE_FARBE, STATUS_FARBE.reserviert)).toBeGreaterThan(1.4);
});

test('неизвестный статус не роняет план и не притворяется свободным', () => {
  expect(statusFarbe('kaputt')).toBeTruthy();
  expect(statusFarbe('kaputt')).not.toBe(STATUS_FARBE.frei);
  expect(statusFarbe(undefined)).toBeTruthy();
});

test('незнакомый статус показывается как есть, а не пустотой', () => {
  expect(statusText('kaputt')).toBe('kaputt');
  expect(statusText('frei')).toBe('frei');
  expect(statusText(undefined)).toBe('');
});
