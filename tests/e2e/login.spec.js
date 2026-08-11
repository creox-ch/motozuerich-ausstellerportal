import { test, expect } from '@playwright/test';

/**
 * E2E: экран входа. Наши API замоканы через page.route — ни Supabase,
 * ни Resend для этих тестов не нужны.
 *
 * Тесты закрепляют требования к поведению, а не вёрстку: человек должен
 * понимать, что произошло, на каждом шаге — и когда код ушёл, и когда его
 * адрес не допущен, и когда код неверный.
 */

test('шаг 1: поле почты и кнопка запроса кода', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Anmelden' })).toBeVisible();
  await expect(page.getByLabel('E-Mail-Adresse')).toBeEditable();
  await expect(page.getByRole('button', { name: 'Code anfordern' })).toBeEnabled();
});

test('адрес не в списке допущенных → объяснение и путь дальше', async ({ page }) => {
  await page.route('**/api/auth/request-code', (route) =>
    route.fulfill({ json: { ok: true, allowed: false } })
  );

  await page.goto('/');
  await page.getByLabel('E-Mail-Adresse').fill('fremd@example.ch');
  await page.getByRole('button', { name: 'Code anfordern' }).click();

  await expect(page.getByText(/nicht freigegeben/)).toBeVisible();
  // Человека не бросают в тупик: сказано, к кому идти.
  await expect(page.getByText(/Messeleitung/)).toBeVisible();
  // И на шаг с кодом не переводят — кода не будет.
  await expect(page.getByLabel('Code aus der E-Mail')).toHaveCount(0);
});

test('код отправлен → появляется поле для кода', async ({ page }) => {
  await page.route('**/api/auth/request-code', (route) =>
    route.fulfill({ json: { ok: true, allowed: true } })
  );

  await page.goto('/');
  await page.getByLabel('E-Mail-Adresse').fill('firma@example.ch');
  await page.getByRole('button', { name: 'Code anfordern' }).click();

  await expect(page.getByLabel('Code aus der E-Mail')).toBeVisible();
  await expect(page.getByText(/Code geschickt/)).toBeVisible();
});

test('неверный код → ошибка, человек остаётся на странице входа', async ({ page }) => {
  await page.route('**/api/auth/request-code', (route) =>
    route.fulfill({ json: { ok: true, allowed: true } })
  );
  await page.route('**/api/auth/verify', (route) =>
    route.fulfill({ status: 401, json: { ok: false, error: 'Code ungültig oder abgelaufen.' } })
  );

  await page.goto('/');
  await page.getByLabel('E-Mail-Adresse').fill('firma@example.ch');
  await page.getByRole('button', { name: 'Code anfordern' }).click();
  await page.getByLabel('Code aus der E-Mail').fill('000000');
  await page.getByRole('button', { name: 'Anmelden' }).click();

  await expect(page.getByText(/ungültig oder abgelaufen/)).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test('верный код → человек уходит в кабинет', async ({ page }) => {
  await page.route('**/api/auth/request-code', (route) =>
    route.fulfill({ json: { ok: true, allowed: true } })
  );
  await page.route('**/api/auth/verify', (route) => route.fulfill({ json: { ok: true } }));
  // Настоящий /portal отдаёт серверный гард, а сессии в тесте нет — подменяем
  // саму страницу, чтобы проверить именно переход.
  await page.route('**/portal', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>Übersicht</h1>' })
  );

  await page.goto('/');
  await page.getByLabel('E-Mail-Adresse').fill('firma@example.ch');
  await page.getByRole('button', { name: 'Code anfordern' }).click();
  await page.getByLabel('Code aus der E-Mail').fill('123456');
  await page.getByRole('button', { name: 'Anmelden' }).click();

  await expect(page).toHaveURL(/\/portal$/);
});

test('можно вернуться и ввести другой адрес', async ({ page }) => {
  await page.route('**/api/auth/request-code', (route) =>
    route.fulfill({ json: { ok: true, allowed: true } })
  );

  await page.goto('/');
  await page.getByLabel('E-Mail-Adresse').fill('firma@example.ch');
  await page.getByRole('button', { name: 'Code anfordern' }).click();
  await expect(page.getByLabel('Code aus der E-Mail')).toBeVisible();

  await page.getByRole('button', { name: /Andere E-Mail-Adresse/ }).click();
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible();
});

test('кабинет без входа не открывается', async ({ page }) => {
  // Гард серверный: страница с данными компании не должна доехать до браузера
  // даже на мгновение.
  await page.goto('/portal');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Anmelden' })).toBeVisible();
});

test('кабинет закрыт от поисковиков', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.ok()).toBeTruthy();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('со входа есть путь к прототипу, и он открывается', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Prototyp/ }).click();

  await expect(page).toHaveURL(/\/prototyp$/);
  await expect(page.getByRole('heading', { name: 'Übersicht', level: 1 })).toBeVisible();
});
