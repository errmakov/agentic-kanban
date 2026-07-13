import { test, expect } from '@playwright/test';

test('emoji reaction bar shows six buttons on the home page', async ({ page }) => {
  await page.goto('/');

  for (const emoji of ['👍', '❤️', '😂', '🔥', '🎉', '🤯']) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('clicking an emoji button increments its count', async ({ page }) => {
  await page.goto('/');

  const thumbsBtn = page.getByRole('button', { name: 'React with 👍' });
  await expect(thumbsBtn).toBeVisible();

  const countBefore = parseInt(
    (await thumbsBtn.locator('span.font-mono').textContent()) ?? '0',
    10,
  );

  await thumbsBtn.click();

  await expect(thumbsBtn.locator('span.font-mono')).toHaveText(String(countBefore + 1));
});
