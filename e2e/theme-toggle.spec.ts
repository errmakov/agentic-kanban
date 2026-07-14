import { test, expect } from '@playwright/test';

test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear persisted preference so each test starts from a clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('theme'));
    // Remove dark class in case a prior test left it
    await page.evaluate(() =>
      document.documentElement.classList.remove('dark'),
    );
  });

  test('toggle button is visible in the header', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: /toggle dark mode/i }),
    ).toBeVisible();
  });

  test('clicking the toggle adds and removes the dark class on html', async ({
    page,
  }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: /toggle dark mode/i });

    // Start in light mode
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await button.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await button.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('chosen theme persists across page reload', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: /toggle dark mode/i });

    await button.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    // Flash-prevention inline script should re-apply dark before paint
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('aria-pressed attribute reflects current theme', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: /toggle dark mode/i });

    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
