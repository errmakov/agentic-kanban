import { test, expect } from '@playwright/test';

const EMOJIS = ['👍', '🎉', '🤔', '❤️', '🚀'];

test('reaction bar shows all emoji buttons on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('group', { name: 'Reactions' })).toBeVisible();
  for (const emoji of EMOJIS) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('clicking an emoji button increments its count by 1', async ({ page }) => {
  await page.goto('/');

  const button = page.getByRole('button', { name: /React with 👍/ });
  const countEl = button.locator('.tabular-nums');

  // Wait for the initial fetch to populate counts
  await expect(countEl).toBeVisible();
  const before = Number(await countEl.textContent());

  await button.click();

  await expect(countEl).toHaveText(String(before + 1));
});
