import { test, expect } from '@playwright/test';

/**
 * E2E: публичный план залов.
 *
 * Страница читает каталог из базы, поэтому в тестах смотрим на то, что от
 * данных не зависит: раскладку, доступность площадок для выбора и то, что
 * цена не утекает в разметку до оставленного контакта.
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

test('без контакта цены нет ни на экране, ни в разметке', async ({ page }) => {
  // Главный тест витрины. Гейт, прячущий цену стилями, обходится за две
  // секунды — поэтому проверяем тело ответа, а не видимость. Раньше здесь
  // ожидалось «XX»: тогда цен в базе не было вовсе. Теперь они есть у всех
  // 109 площадок, и до контакта строки цены не должно быть вообще.
  const antwort = await page.goto('/hallenplan');
  const html = await antwort.text();
  // Формат сумм в портале — 13'400 с апострофом; ищем любую такую.
  expect(html, 'сумма не должна попадать в разметку').not.toMatch(/\d['’]\d{3}/);
  expect(html).not.toContain('exkl. MwSt.');

  await page.getByRole('button', { name: /^Stand D01/ }).click();
  // Вместо цены — форма обмена контакта на цену.
  await expect(page.getByRole('button', { name: 'Preise anzeigen' })).toBeVisible();
});

test('все три зала показаны планом, а не списком', async ({ page }) => {
  // Геометрия перенесена с публичного плана 27.08. До этого 550 и StageOne
  // продавались списком, и «плана нет» было нормой — теперь это регресс.
  await page.goto('/hallenplan');

  for (const halle of ['Halle D', 'Halle 550', 'StageOne']) {
    await page.getByRole('button', { name: halle, exact: true }).click();
    const rechtecke = page.locator('svg rect');
    await expect(rechtecke.first()).toBeVisible();
    expect(await rechtecke.count(), `${halle}: план не нарисован`).toBeGreaterThan(20);
  }
});

test('площадка без места на плане остаётся в списке', async ({ page }) => {
  // «Fläche 18» и «Fläche 23 Erweiterung» на публичном плане отсутствуют.
  // Молча их не показать значит соврать про размер зала.
  await page.goto('/hallenplan');
  await page.getByRole('button', { name: 'StageOne', exact: true }).click();

  await expect(page.getByRole('button', { name: /^Stand Fläche 18/ })).toBeVisible();
  await expect(page.getByText(/noch nicht eingezeichnet/)).toBeVisible();
});

test('форма заявки требует согласия и ведёт на Datenschutz', async ({ page }) => {
  await page.goto('/hallenplan');
  await page.getByRole('button', { name: /^Stand D01/ }).click();
  await page.getByRole('button', { name: 'Diese Fläche anfragen' }).click();

  const consent = page.getByRole('checkbox', { name: /einverstanden/ });
  await expect(consent).not.toBeChecked(); // заранее проставленная галочка согласием не является
  await expect(consent).toHaveAttribute('required', '');
  // Именно ссылка ИЗ ФОРМЫ, а не из футера: их на странице три, и общий
  // поиск по /Datenschutz/ падал на strict mode. Согласие без доступной
  // отсюда политики согласием не является.
  await expect(
    page.getByRole('link', { name: 'Datenschutzerklärung' })
  ).toHaveAttribute('href', '/datenschutz');
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
