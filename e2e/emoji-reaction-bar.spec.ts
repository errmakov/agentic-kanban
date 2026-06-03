import { test, expect } from '@playwright/test';

test('emoji reaction bar shows four emoji buttons', async ({ page }) => {
  await page.goto('/');
  for (const emoji of ['👍', '❤️', '🎉', '🚀']) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('clicking an emoji button increments its count', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'React with 👍' });
  await button.waitFor();

  const before = parseInt((await button.textContent()) ?? '0');
  await button.click();
  await expect(button).toHaveText(new RegExp(`${before + 1}`));
});

test('emoji counts persist after page reload', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'React with 🎉' });
  await button.waitFor();

  const before = parseInt((await button.textContent()) ?? '0');
  await button.click();
  await expect(button).toHaveText(new RegExp(`${before + 1}`));

  await page.reload();
  await expect(page.getByRole('button', { name: 'React with 🎉' })).toHaveText(
    new RegExp(`${before + 1}`),
  );
});
