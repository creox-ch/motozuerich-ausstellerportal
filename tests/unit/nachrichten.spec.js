import { test, expect } from '@playwright/test';
import { gruppiereThreads, MAX_LAENGE, validateNachricht } from '../../lib/nachrichten';

/**
 * Unit: правила переписки.
 *
 * Главное здесь — «на что мы ещё не ответили». Отметки «прочитано» в базе нет
 * намеренно, признак вычисляется из самих сообщений, поэтому он обязан быть
 * проверен: ошибка в нём означает молча потерянный вопрос экспонента.
 */

const A = 'aaaaaaaa-1111-1111-1111-111111111111';
const B = 'bbbbbbbb-2222-2222-2222-222222222222';

function n(companyId, von, created_at, firma) {
  return { id: `${companyId}-${created_at}`, company_id: companyId, von, created_at, mz_companies: { name: firma } };
}

test('пустое сообщение не отправляется', () => {
  expect(validateNachricht({ text: '   ' }).ok).toBe(false);
  expect(validateNachricht({}).ok).toBe(false);
});

test('слишком длинное отклоняется, а не режется молча', () => {
  // Обрезав, мы бы отправили половину вопроса, и человек ждал бы ответа
  // на то, чего мы не получили.
  const res = validateNachricht({ text: 'x'.repeat(MAX_LAENGE + 1) });
  expect(res.ok).toBe(false);
  expect(res.error).toContain('lang');
});

test('ровно предельная длина проходит', () => {
  expect(validateNachricht({ text: 'x'.repeat(MAX_LAENGE) }).ok).toBe(true);
});

test('пробелы по краям убираются', () => {
  expect(validateNachricht({ text: '  Frage zum Aufbau  ' }).value.text).toBe('Frage zum Aufbau');
});

test('последнее слово за экспонентом — разговор ждёт ответа', () => {
  const threads = gruppiereThreads([
    n(A, 'aussteller', '2026-08-01T10:00:00Z', 'Firma A'),
    n(A, 'messeleitung', '2026-08-01T11:00:00Z', 'Firma A'),
    n(A, 'aussteller', '2026-08-02T09:00:00Z', 'Firma A'),
  ]);
  expect(threads).toHaveLength(1);
  expect(threads[0].offen).toBe(true);
});

test('ответили последними — разговор закрыт', () => {
  const threads = gruppiereThreads([
    n(A, 'aussteller', '2026-08-01T10:00:00Z', 'Firma A'),
    n(A, 'messeleitung', '2026-08-01T11:00:00Z', 'Firma A'),
  ]);
  expect(threads[0].offen).toBe(false);
});

test('ждущие ответа идут первыми, даже если писали давно', () => {
  // Иначе свежий закрытый разговор оттеснит вниз вопрос недельной давности,
  // и именно он и потеряется.
  const threads = gruppiereThreads([
    n(A, 'aussteller', '2026-08-01T10:00:00Z', 'Firma A'),
    n(B, 'aussteller', '2026-08-05T10:00:00Z', 'Firma B'),
    n(B, 'messeleitung', '2026-08-05T12:00:00Z', 'Firma B'),
  ]);
  expect(threads.map((t) => t.firma)).toEqual(['Firma A', 'Firma B']);
  expect(threads[0].offen).toBe(true);
});

test('разговоры разных компаний не смешиваются', () => {
  const threads = gruppiereThreads([
    n(A, 'aussteller', '2026-08-01T10:00:00Z', 'Firma A'),
    n(B, 'aussteller', '2026-08-01T10:30:00Z', 'Firma B'),
  ]);
  expect(threads).toHaveLength(2);
  expect(threads.every((t) => t.nachrichten.length === 1)).toBe(true);
});

test('пустая переписка не роняет группировку', () => {
  expect(gruppiereThreads([])).toEqual([]);
});

test('строка без компании пропускается, а не создаёт разговор-призрак', () => {
  const threads = gruppiereThreads([
    { id: 'x', company_id: null, von: 'aussteller', created_at: '2026-08-01T10:00:00Z' },
    n(A, 'aussteller', '2026-08-01T11:00:00Z', 'Firma A'),
  ]);
  expect(threads).toHaveLength(1);
  expect(threads[0].companyId).toBe(A);
});
