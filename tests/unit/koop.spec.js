import { test, expect } from '@playwright/test';
import { MAX_PUNKTE, darfEinreichen, gruppiereMassnahmen, punkteSumme, validateNachweis } from '../../lib/koop';

/**
 * Unit: совместный маркетинг.
 *
 * Здесь считаются баллы, которые превращаются в скидку с настоящего счёта,
 * поэтому проверяется именно арифметика и правила зачёта.
 */

const KATALOG = [
  { id: 'ins_ganz', gruppe: 'Inserate', gruppe_modus: 'einfach', titel: 'Ganzseitig', punkte: 20 },
  { id: 'ins_halb', gruppe: 'Inserate', gruppe_modus: 'einfach', titel: 'Halbseitig', punkte: 10 },
  { id: 'instagram', gruppe: 'Social Media', gruppe_modus: 'mehrfach', titel: 'Instagram', punkte: 10 },
  { id: 'reel', gruppe: 'Social Media', gruppe_modus: 'mehrfach', titel: 'Reel', punkte: 20 },
];

const M = (id) => KATALOG.find((m) => m.id === id);

test('нужен хотя бы один беглый след: ссылка или файл', () => {
  const ohne = validateNachweis({ massnahme_id: 'instagram' }, { hatDatei: false });
  expect(ohne.ok).toBe(false);
  expect(ohne.error).toContain('Beleg');

  expect(validateNachweis({ massnahme_id: 'instagram' }, { hatDatei: true }).ok).toBe(true);
  expect(
    validateNachweis({ massnahme_id: 'instagram', link: 'https://example.ch/post' }).ok
  ).toBe(true);
});

test('замечание вместо доказательства не проходит', () => {
  // Проверять по одному «мы всё сделали» Messeleitung нечего.
  const res = validateNachweis({ massnahme_id: 'instagram', bemerkung: 'gemacht' });
  expect(res.ok).toBe(false);
});

test('огрызок ссылки не принимается', () => {
  expect(validateNachweis({ massnahme_id: 'instagram', link: 'example.ch' }).ok).toBe(false);
  expect(validateNachweis({ massnahme_id: 'instagram', link: 'javascript:alert(1)' }).ok).toBe(false);
});

test('дата в человеческом формате отклоняется, а не сохраняется как мусор', () => {
  const res = validateNachweis({
    massnahme_id: 'instagram',
    link: 'https://example.ch',
    umgesetzt_am: '15.01.2027',
  });
  expect(res.ok).toBe(false);
});

test('по одной мере — одно живое подтверждение', () => {
  const vorhandene = [{ massnahme_id: 'instagram', status: 'eingereicht' }];
  const res = darfEinreichen(M('instagram'), vorhandene, KATALOG);
  expect(res.ok).toBe(false);
  expect(res.error).toContain('bereits');
});

test('отклонённое подтверждение не мешает подать заново', () => {
  // Человек исправился — дорога открыта.
  const vorhandene = [{ massnahme_id: 'instagram', status: 'abgelehnt' }];
  expect(darfEinreichen(M('instagram'), vorhandene, KATALOG).ok).toBe(true);
});

test('в группе einfach засчитывается только одна мера', () => {
  const vorhandene = [{ massnahme_id: 'ins_ganz', status: 'bestaetigt' }];
  const res = darfEinreichen(M('ins_halb'), vorhandene, KATALOG);
  expect(res.ok).toBe(false);
  expect(res.error).toContain('Inserate');
});

test('в группе mehrfach несколько мер — это норма', () => {
  const vorhandene = [{ massnahme_id: 'instagram', status: 'bestaetigt' }];
  expect(darfEinreichen(M('reel'), vorhandene, KATALOG).ok).toBe(true);
});

test('неизвестная мера не проходит', () => {
  expect(darfEinreichen(undefined, [], KATALOG).ok).toBe(false);
});

test('считаются только подтверждённые баллы', () => {
  const nachweise = [
    { massnahme_id: 'ins_ganz', status: 'bestaetigt', punkte: 20 },
    { massnahme_id: 'instagram', status: 'eingereicht', punkte: null },
  ];
  const summe = punkteSumme(nachweise, KATALOG);
  expect(summe.bestaetigt).toBe(20);
  expect(summe.offen).toBe(10);
});

test('отклонённое не даёт баллов', () => {
  const nachweise = [{ massnahme_id: 'reel', status: 'abgelehnt', punkte: null }];
  expect(punkteSumme(nachweise, KATALOG).bestaetigt).toBe(0);
});

test('подтверждённое считается по снимку, а не по текущему каталогу', () => {
  // Меру удешевили после подтверждения — начисленное не должно усохнуть.
  const nachweise = [{ massnahme_id: 'ins_ganz', status: 'bestaetigt', punkte: 20 }];
  const guenstigerKatalog = KATALOG.map((m) => (m.id === 'ins_ganz' ? { ...m, punkte: 5 } : m));
  expect(punkteSumme(nachweise, guenstigerKatalog).bestaetigt).toBe(20);
});

test('сверх сотни не обещаем больше максимума', () => {
  const nachweise = [
    { massnahme_id: 'a', status: 'bestaetigt', punkte: 80 },
    { massnahme_id: 'b', status: 'bestaetigt', punkte: 40 },
  ];
  const summe = punkteSumme(nachweise, KATALOG);
  expect(summe.bestaetigt).toBe(MAX_PUNKTE);
  expect(summe.ueberschuss).toBe(20);
  expect(summe.anteil).toBe(100);
});

test('пустой список баллов не роняет расчёт', () => {
  expect(punkteSumme([], KATALOG)).toEqual({ bestaetigt: 0, ueberschuss: 0, offen: 0, anteil: 0 });
});

test('группировка сохраняет порядок каталога и режим группы', () => {
  const gruppen = gruppiereMassnahmen(KATALOG);
  expect(gruppen.map((g) => g.gruppe)).toEqual(['Inserate', 'Social Media']);
  expect(gruppen[0].modus).toBe('einfach');
  expect(gruppen[1].massnahmen).toHaveLength(2);
});
