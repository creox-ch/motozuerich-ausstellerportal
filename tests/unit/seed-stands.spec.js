import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Unit: структурная проверка каталога площадок.
 *
 * Проверяется файл `supabase/seed-stands.sql`, а не база: файл поднимает
 * чистый проект Supabase, и разъехаться с базой он уже дважды успевал
 * (пропавшие колонки, старая нумерация Halle 550). Тест ловит не расхождение
 * с базой — это делает сверка руками, — а внутренние противоречия самого
 * файла, которые ни один взгляд не заметит на 109 строках.
 *
 * Ловушка, ради которой всё: если однажды нарисованные размеры попадут
 * в `breite_m`, площадь площадки перестанет сходиться с прайсом. Проверка
 * «площадь равна произведению сторон» краснеет ровно на этом.
 */

const SPALTEN = [
  'id', 'plan_id', 'halle', 'lage', 'breite_m', 'tiefe_m', 'flaeche_m2',
  'pos_x', 'pos_y', 'plan_b', 'plan_t', 'gaeste_karten', 'aussteller_karten', 'status',
];

function felder(zeile) {
  const inhalt = zeile.trim().replace(/^\(/, '').replace(/\),?$/, '');
  const out = [];
  let cur = '';
  let inStr = false;
  for (const c of inhalt) {
    if (c === "'") { inStr = !inStr; cur += c; continue; }
    if (c === ',' && !inStr) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function wert(roh) {
  if (roh === 'null') return null;
  if (roh.startsWith("'")) return roh.slice(1, -1).replace(/''/g, "'");
  return Number(roh);
}

function ladeStands() {
  const datei = path.join(process.cwd(), 'supabase', 'seed-stands.sql');
  const text = fs.readFileSync(datei, 'utf8');

  const kopf = text.indexOf('\nvalues');
  const fuss = text.indexOf('\non conflict');
  expect(kopf, 'в файле должен быть блок values').toBeGreaterThan(0);
  expect(fuss, 'в файле должен быть on conflict').toBeGreaterThan(kopf);

  return text
    .slice(kopf, fuss)
    .split(/\r?\n/)
    .filter((z) => /^\s*\(/.test(z))
    .map((z) => {
      const f = felder(z);
      expect(f.length, `строка «${f[0]}»: полей должно быть ${SPALTEN.length}`).toBe(SPALTEN.length);
      return Object.fromEntries(SPALTEN.map((name, i) => [name, wert(f[i])]));
    });
}

const stands = ladeStands();

test('каталог — 109 площадок в трёх залах', () => {
  expect(stands).toHaveLength(109);

  const proHalle = {};
  for (const s of stands) proHalle[s.halle] = (proHalle[s.halle] || 0) + 1;
  expect(proHalle).toEqual({ 'Halle D': 23, 'Halle 550': 25, StageOne: 61 });
});

test('идентификаторы уникальны', () => {
  const ids = stands.map((s) => s.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('номера публичного плана уникальны — один квадрат не может быть двумя', () => {
  const planIds = stands.map((s) => s.plan_id).filter(Boolean);
  expect(new Set(planIds).size).toBe(planIds.length);
});

test('площадь сходится со сторонами там, где стороны известны', () => {
  // Это же считает триггер mz_stands_flaeche. Расхождение здесь означает,
  // что в breite_m/tiefe_m попало что-то не из прайса — например размеры
  // с публичного плана, где Galerie нарисована полосой.
  const abweichungen = stands
    .filter((s) => s.breite_m !== null && s.tiefe_m !== null)
    .filter((s) => Math.abs(s.breite_m * s.tiefe_m - s.flaeche_m2) > 0.005)
    .map((s) => `${s.id}: ${s.breite_m}×${s.tiefe_m} ≠ ${s.flaeche_m2}`);

  expect(abweichungen).toEqual([]);
});

test('у каждой площадки есть площадь — её продают, а не рисуют', () => {
  const ohne = stands.filter((s) => !(s.flaeche_m2 > 0)).map((s) => s.id);
  expect(ohne).toEqual([]);
});

test('геометрия либо полная, либо её нет вовсе', () => {
  // Половина координат хуже, чем их отсутствие: прямоугольник уезжает в угол,
  // а не пропадает из плана.
  const halb = stands
    .filter((s) => {
      const teile = [s.pos_x, s.pos_y, s.plan_b, s.plan_t];
      const gesetzt = teile.filter((v) => v !== null).length;
      return gesetzt !== 0 && gesetzt !== teile.length;
    })
    .map((s) => s.id);

  expect(halb).toEqual([]);
});

test('без плана остались ровно те две площадки, которых нет на публичном плане', () => {
  // Не «сколько-то без геометрии», а именно эти две: любая третья означает,
  // что при переносе кого-то потеряли.
  const ohnePlan = stands.filter((s) => s.pos_x === null).map((s) => s.id).sort();
  expect(ohnePlan).toEqual(['Fläche 18', 'Fläche 23 Erweiterung']);

  for (const s of stands) {
    if (s.pos_x === null) expect(s.plan_id, `${s.id}: без координат не может быть номера плана`).toBe(null);
    else expect(s.plan_id, `${s.id}: с координатами должен быть номер плана`).not.toBe(null);
  }
});

test('статусы только из разрешённого набора', () => {
  const erlaubt = new Set(['frei', 'reserviert', 'vergeben', 'gesperrt']);
  const falsch = stands.filter((s) => !erlaubt.has(s.status)).map((s) => `${s.id}: ${s.status}`);
  expect(falsch).toEqual([]);
});

test('свободных 52 — столько же, сколько на публичном плане', () => {
  expect(stands.filter((s) => s.status === 'frei')).toHaveLength(52);
});

test('статус и привязка к компании не перезаписываются повторным запуском', () => {
  // Каталог ведём мы, занятость — Messeleitung. Если статус попадёт
  // в do update set, ночной прогон сидов вернёт проданные площадки
  // в продажу, и узнаем мы об этом от второго покупателя.
  const text = fs.readFileSync(path.join(process.cwd(), 'supabase', 'seed-stands.sql'), 'utf8');
  const update = text.slice(text.indexOf('on conflict'));
  expect(update).not.toContain('status');
  expect(update).not.toContain('company_id');
});
