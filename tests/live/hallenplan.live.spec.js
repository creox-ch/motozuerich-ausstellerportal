import { test, expect } from '@playwright/test';

/**
 * E2E: публичный план залов.
 *
 * Страница читает каталог из базы, поэтому в тестах смотрим на то, что от
 * данных не зависит: раскладку, доступность площадок для выбора и честную
 * пометку вместо неизвестной цены.
 *
 * Мобильная проверка здесь не для галочки: у выставки 71% трафика с телефонов
 * (разбор сезона 2026). Первая версия страницы на 375px была нерабочей —
 * колонка с планом схлопывалась в ноль, а площадки в плане получались
 * размером 5×4 пикселя.
 */

test('страница открывается без входа', async ({ page }) => {
  await page.goto('/hallenplan');
  await expect(page.getByRole('heading', { name: /Hallenplan/ })).toBeVisible();
});

test('площадки доступны как настоящие кнопки со статусом в подписи', async ({ page }) => {
  await page.goto('/hallenplan');
  const erste = page.getByRole('button', { name: /^Stand D\d+/ }).first();
  await expect(erste).toBeVisible();
});

test('выбор площадки открывает карточку с размером', async ({ page }) => {
  await page.goto('/hallenplan');
  await page.getByRole('button', { name: /^Stand D01/ }).click();
  await expect(page.getByRole('heading', { name: /Stand D01/ })).toBeVisible();
  await expect(page.getByText('Format')).toBeVisible();
});

test('пока цена не задана — показываем XX, а не число', async ({ page }) => {
  // Правдоподобная сумма читается как предложение и переживает запуск
  // незамеченной. Пустое место человека тоже не устраивает — поэтому XX.
  await page.goto('/hallenplan');
  await page.getByRole('button', { name: /^Stand D01/ }).click();
  await expect(page.getByText('XX', { exact: true })).toBeVisible();
  await expect(page.getByText(/Preise für die Ausgabe 2027 werden noch festgelegt/)).toBeVisible();
});

test('форма заявки требует согласия и ведёт на Datenschutz', async ({ page }) => {
  await page.goto('/hallenplan');
  await page.getByRole('button', { name: /^Stand D01/ }).click();
  await page.getByRole('button', { name: 'Diese Fläche anfragen' }).click();

  const consent = page.getByRole('checkbox', { name: /einverstanden/ });
  await expect(consent).not.toBeChecked(); // заранее проставленная галочка согласием не является
  await expect(consent).toHaveAttribute('required', '');
  await expect(page.getByRole('link', { name: /Datenschutz/ })).toHaveAttribute('href', '/datenschutz');
});

test.describe('мобильный экран', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('план виден, а площадки выбираются пальцем', async ({ page }) => {
    await page.goto('/hallenplan');

    // План не должен схлопываться: колонка в 1fr рядом с панелью в 320px
    // на узком экране получала нулевую ширину.
    const plan = page.locator('svg').first();
    const box = await plan.boundingBox();
    expect(box.width, 'план залов должен быть виден на телефоне').toBeGreaterThan(200);

    // Кнопка выбора должна быть достаточной для пальца.
    const knopf = page.getByRole('button', { name: /^Stand D01/ });
    const kb = await knopf.boundingBox();
    expect(kb.height, 'высота кнопки').toBeGreaterThanOrEqual(44);
    expect(kb.width, 'ширина кнопки').toBeGreaterThanOrEqual(44);
  });
});
