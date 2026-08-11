import { test, expect } from '@playwright/test';
import {
  replyTo,
  resolveRecipient,
  subjectWithOverrideHint,
  DEFAULT_REPLY_TO,
} from '../../lib/mail';

/**
 * Unit: адресация писем.
 *
 * Главное требование, которое здесь закрепляется: с непроизводственного
 * окружения письмо не может уйти настоящему экспоненту. Проверяем это как
 * поведение, а не как наличие переменной.
 */

test('Reply-To по умолчанию — живой человек, а не noreply', () => {
  expect(replyTo({})).toBe(DEFAULT_REPLY_TO);
  expect(DEFAULT_REPLY_TO).toContain('@motozuerich.ch');
});

test('Reply-To переопределяется переменной окружения', () => {
  expect(replyTo({ PORTAL_REPLY_TO: 'messe@example.ch' })).toBe('messe@example.ch');
});

test('пустой PORTAL_REPLY_TO не считается значением', () => {
  expect(replyTo({ PORTAL_REPLY_TO: '   ' })).toBe(DEFAULT_REPLY_TO);
});

test('без перехвата письмо идёт настоящему получателю', () => {
  const r = resolveRecipient('firma@example.ch', {});
  expect(r).toEqual({ to: 'firma@example.ch', intended: 'firma@example.ch', overridden: false });
});

test('перехват включён → письмо уходит на тестовый ящик, а не экспоненту', () => {
  const r = resolveRecipient('firma@example.ch', {
    PORTAL_MAIL_OVERRIDE: 'assistant@creox.ch',
  });
  expect(r.to).toBe('assistant@creox.ch');
  expect(r.overridden).toBe(true);
  // Настоящий адрес не теряется — он нужен, чтобы понять, кому предназначалось.
  expect(r.intended).toBe('firma@example.ch');
});

test('пустой PORTAL_MAIL_OVERRIDE не включает перехват', () => {
  // Иначе пустая переменная тихо отправляла бы письма в никуда.
  const r = resolveRecipient('firma@example.ch', { PORTAL_MAIL_OVERRIDE: '' });
  expect(r.to).toBe('firma@example.ch');
  expect(r.overridden).toBe(false);
});

test('без адреса получателя — ошибка, а не молчаливая отправка', () => {
  expect(() => resolveRecipient('', {})).toThrow(/получател/);
  expect(() => resolveRecipient(undefined, {})).toThrow(/получател/);
});

test('при перехвате тема письма называет настоящего получателя', () => {
  const r = resolveRecipient('firma@example.ch', { PORTAL_MAIL_OVERRIDE: 'assistant@creox.ch' });
  expect(subjectWithOverrideHint('Ihr Anmeldecode', r)).toBe(
    '[TEST → firma@example.ch] Ihr Anmeldecode'
  );
});

test('без перехвата тема письма не меняется', () => {
  const r = resolveRecipient('firma@example.ch', {});
  expect(subjectWithOverrideHint('Ihr Anmeldecode', r)).toBe('Ihr Anmeldecode');
});
