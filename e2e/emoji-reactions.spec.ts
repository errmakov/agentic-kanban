import { test, expect } from '@playwright/test';

const EMOJIS = ['👍', '🔥', '❤️', '😂', '🚀'];

test('emoji reaction bar is visible with all five emoji buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Emoji reactions' })).toBeVisible();
  for (const emoji of EMOJIS) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('clicking an emoji button increments its count', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'React with 👍' });
  await expect(button).toBeVisible();

  const before = parseInt((await button.textContent())?.match(/\d+/)?.[0] ?? '0', 10);
  await button.click();
  await expect(button).toContainText(String(before + 1));
});
