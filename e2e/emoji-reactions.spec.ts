import { test, expect } from '@playwright/test';

test('emoji reaction bar shows four buttons on the home page', async ({ page }) => {
  await page.goto('/');
  for (const emoji of ['👍', '❤️', '🔥', '🎉']) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('tapping an emoji increments its counter', async ({ page }) => {
  await page.goto('/');

  const fireBtn = page.getByRole('button', { name: 'React with 🔥' });
  await fireBtn.waitFor({ state: 'visible' });

  const countSpan = fireBtn.locator('span').last();
  const before = Number(await countSpan.textContent());

  await fireBtn.click();

  await expect(countSpan).toHaveText(String(before + 1), { timeout: 5000 });
});
