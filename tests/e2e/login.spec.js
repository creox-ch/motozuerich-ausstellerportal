import { test, expect } from '@playwright/test';

/**
 * E2E: экран входа через next dev. Внешние сервисы не нужны — на этапе 0
 * страница ничего никуда не отправляет.
 *
 * Тесты закрепляют требование, а не текущую вёрстку: на входе должно быть
 * поле для почты и кнопка запроса кода, и пока форма не подключена —
 * пользователь должен видеть, что она неактивна, а не гадать, почему
 * нажатие ничего не делает.
 */

test('экран входа: заголовок, поле почты, кнопка запроса кода', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Anmelden' })).toBeVisible();
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Code anfordern' })).toBeVisible();
});

test('этап 0: форма отключена и об этом сказано явно', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByLabel('E-Mail-Adresse')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Code anfordern' })).toBeDisabled();
  await expect(page.getByText('Der Login wird gerade eingerichtet')).toBeVisible();
});

test('кабинет закрыт от поисковиков', async ({ page }) => {
  // За входом персональные данные компаний — индексация недопустима.
  const response = await page.goto('/');
  expect(response.ok()).toBeTruthy();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/
  );
});

test('со входа есть путь к прототипу', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Prototyp/ })).toHaveAttribute('href', '/prototyp');
});

test('ссылка на прототип реально открывает прототип', async ({ page }) => {
  // Проверяем переход, а не атрибут: файл лежит как public/prototyp.html и без
  // rewrite чистый /prototyp отдавал бы 404 — тест на href этого не увидел бы.
  await page.goto('/');
  await page.getByRole('link', { name: /Prototyp/ }).click();

  await expect(page).toHaveURL(/\/prototyp$/);
  await expect(page.getByRole('heading', { name: 'Übersicht', level: 1 })).toBeVisible();
  await expect(page.getByText('Prototyp', { exact: true }).first()).toBeVisible();
});
