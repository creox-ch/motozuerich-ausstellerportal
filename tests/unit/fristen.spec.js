import { test, expect } from '@playwright/test';
import { formatFrist, leiteStatusAb, profilVollstaendig, XX } from '../../lib/fristen';

/**
 * Unit: сроки в чек-листе.
 *
 * Главное здесь — что неназначенный срок показывается заглушкой, а не
 * правдоподобной датой: срок читается экспонентом как обязательство.
 */

test('срока нет — показываем заглушку, как в прототипе', () => {
  expect(formatFrist({ datum: null })).toBe(XX);
  expect(formatFrist({})).toBe(XX);
  expect(formatFrist(null)).toBe(XX);
});

test('одна дата — по-швейцарски', () => {
  expect(formatFrist({ datum: '2027-02-17' })).toBe('17.02.2027');
});

test('диапазон внутри месяца не повторяет месяц', () => {
  expect(formatFrist({ datum: '2027-02-19', datum_bis: '2027-02-21' })).toBe('19.–21.02.2027');
});

test('диапазон через месяц пишется полностью', () => {
  expect(formatFrist({ datum: '2027-01-30', datum_bis: '2027-02-02' })).toBe(
    '30.01.2027–02.02.2027'
  );
});

test('конец без начала не выдумывается', () => {
  // База такое не примет (constraint), но функция не должна на этом падать.
  expect(formatFrist({ datum: null, datum_bis: '2027-02-21' })).toBe(XX);
});

test('профиль заполнен только когда есть всё, что уходит в каталог', () => {
  const voll = { kategorie: 'Motorräder', beschreibung: 'Text', logo_path: 'x/logo.png' };
  expect(profilVollstaendig(voll)).toBe(true);

  expect(profilVollstaendig({ ...voll, logo_path: null })).toBe(false);
  expect(profilVollstaendig({ ...voll, beschreibung: '' })).toBe(false);
  expect(profilVollstaendig({ ...voll, kategorie: null })).toBe(false);
  expect(profilVollstaendig(null)).toBe(false);
});

test('отмечаем сделанным только то, что видим по данным', () => {
  const fakten = { profilVollstaendig: true, technikEingereicht: false, marketingEingereicht: true };

  expect(leiteStatusAb('profil', fakten)).toBe(true);
  expect(leiteStatusAb('technik', fakten)).toBe(false);
  expect(leiteStatusAb('marketing', fakten)).toBe(true);
});

test('про что не знаем — не утверждаем ничего', () => {
  // null, а не false: «не отмечено» и «мы не знаем» — разные вещи, и вторая
  // не должна выглядеть как невыполненная задача.
  expect(leiteStatusAb('anlieferung', {})).toBe(null);
  expect(leiteStatusAb('ausweise', {})).toBe(null);
  expect(leiteStatusAb('messe', {})).toBe(null);
});
