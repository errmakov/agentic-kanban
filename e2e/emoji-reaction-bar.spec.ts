import { test, expect } from '@playwright/test';

test('shows five emoji reaction buttons on the wall', async ({ page }) => {
  await page.goto('/');

  const buttons = page.getByRole('button', { name: /react with/i });
  await expect(buttons).toHaveCount(5);

  for (const emoji of ['👍', '❤️', '🔥', '👏', '😂']) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('clicking an emoji button increments the displayed count', async ({ page }) => {
  await page.goto('/');

  const thumbsUpButton = page.getByRole('button', { name: 'React with 👍' });
  await expect(thumbsUpButton).toBeVisible();

  const countLocator = thumbsUpButton.locator('span:not([aria-hidden])');
  const initialCount = parseInt((await countLocator.textContent()) ?? '0', 10);

  await thumbsUpButton.click();

  await expect(countLocator).toHaveText(String(initialCount + 1));
});
