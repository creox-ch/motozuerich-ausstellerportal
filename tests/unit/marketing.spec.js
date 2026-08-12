import { test, expect } from '@playwright/test';
import { AENDERUNG_TYPEN, MAX_TEXT, validateMarketingAnfrage } from '../../lib/marketing';

/**
 * Unit: заявки по маркетингу.
 *
 * У четырёх видов заявки разные обязательные поля, и это не формальность:
 * запрос дизайна без описания задачи не с чего начинать, а пакет каталога
 * без пакета — пустой звук.
 */

test('пакет каталога выбирается из списка', () => {
  const res = validateMarketingAnfrage({ art: 'online_katalog', auswahl: 'premium' });
  expect(res.ok).toBe(true);
  expect(res.value.auswahl).toBe('premium');
});

test('Basis отдельно не заказывают — он и так у всех', () => {
  const res = validateMarketingAnfrage({ art: 'online_katalog', auswahl: 'basis' });
  expect(res.ok).toBe(false);
  expect(res.error).toContain('Basis');
});

test('выдуманный пакет не проходит', () => {
  expect(validateMarketingAnfrage({ art: 'online_katalog', auswahl: 'gold' }).ok).toBe(false);
});

test('пакет обязателен', () => {
  expect(validateMarketingAnfrage({ art: 'online_katalog' }).ok).toBe(false);
});

test('LED-Wall можно запросить без единого поля', () => {
  // Там нечего заполнять: параметры фиксированные, вопрос один — «хотим».
  expect(validateMarketingAnfrage({ art: 'led_wall' }).ok).toBe(true);
});

test('запрос дизайна без описания задачи не принимается', () => {
  expect(validateMarketingAnfrage({ art: 'design' }).ok).toBe(false);
  expect(validateMarketingAnfrage({ art: 'design', text: 'Reel 9:16' }).ok).toBe(true);
});

test('правка требует и типа, и описания', () => {
  expect(validateMarketingAnfrage({ art: 'aenderung', text: 'neues Logo' }).ok).toBe(false);
  expect(validateMarketingAnfrage({ art: 'aenderung', auswahl: AENDERUNG_TYPEN[0] }).ok).toBe(false);

  const res = validateMarketingAnfrage({
    art: 'aenderung',
    auswahl: AENDERUNG_TYPEN[0],
    text: 'neues Logo im Anhang',
  });
  expect(res.ok).toBe(true);
});

test('чужой тип правки не проходит', () => {
  const res = validateMarketingAnfrage({
    art: 'aenderung',
    auswahl: 'Alles löschen',
    text: 'x',
  });
  expect(res.ok).toBe(false);
});

test('неизвестный вид заявки отклоняется', () => {
  expect(validateMarketingAnfrage({ art: 'plakatwand' }).ok).toBe(false);
  expect(validateMarketingAnfrage({}).ok).toBe(false);
});

test('слишком длинный текст отклоняется, а не режется', () => {
  const res = validateMarketingAnfrage({ art: 'design', text: 'x'.repeat(MAX_TEXT + 1) });
  expect(res.ok).toBe(false);
  expect(res.error).toContain(String(MAX_TEXT));
});

test('огрызок ссылки не принимается', () => {
  const res = validateMarketingAnfrage({ art: 'design', text: 'x', link: 'drive.google.com/x' });
  expect(res.ok).toBe(false);
});

test('пустые поля сохраняются как отсутствие, а не как пустая строка', () => {
  // Пустая строка в базе выглядит как заполненное поле и путает при разборе.
  const res = validateMarketingAnfrage({ art: 'led_wall', text: '   ', link: '' });
  expect(res.value.text).toBe(null);
  expect(res.value.link).toBe(null);
  expect(res.value.auswahl).toBe(null);
});
