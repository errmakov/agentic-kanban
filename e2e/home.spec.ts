import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('emoji reaction buttons are all visible', async ({ page }) => {
  await page.goto('/');
  for (const emoji of ['👍', '❤️', '🔥', '🤔', '👏']) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('clicking an emoji button increments its count', async ({ page }) => {
  await page.goto('/');
  const btn = page.getByRole('button', { name: 'React with 👍' });
  const text = await btn.textContent();
  const before = parseInt(text?.match(/\d+/)?.[0] ?? '0', 10);
  await btn.click();
  await expect(btn).toContainText(String(before + 1));
});
