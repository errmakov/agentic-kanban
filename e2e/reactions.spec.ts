import { test, expect } from '@playwright/test';

test.describe('ReactionBar', () => {
  test('shows five emoji reaction buttons on the home page', async ({ page }) => {
    await page.goto('/');

    const reactionGroup = page.getByRole('group', { name: 'Reactions' });
    await expect(reactionGroup).toBeVisible();

    const buttons = reactionGroup.getByRole('button');
    await expect(buttons).toHaveCount(5);
  });

  test('increments the displayed count when a reaction button is clicked', async ({ page }) => {
    await page.goto('/');

    const button = page.getByRole('button', { name: /react with 👍/i });
    await button.waitFor({ state: 'visible' });

    const countSpan = button.locator('span').last();
    const initialCount = parseInt((await countSpan.textContent()) ?? '0', 10);

    await button.click();

    await expect(countSpan).toHaveText(String(initialCount + 1));
  });
});
