import { test, expect } from '@playwright/test';
import { SPEAKERS } from '../features/speaker-bio-cards/speakers';

test('speaker bio cards section is visible with all speaker names', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Meet the Speakers' })).toBeVisible();
  for (const speaker of SPEAKERS) {
    await expect(page.getByText(speaker.name)).toBeVisible();
  }
});

test('each speaker card has thumbs up and thumbs down buttons', async ({ page }) => {
  await page.goto('/');
  for (const speaker of SPEAKERS) {
    await expect(
      page.getByRole('button', { name: `Thumbs up for ${speaker.name}` }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: `Thumbs down for ${speaker.name}` }),
    ).toBeVisible();
  }
});

test('clicking thumbs up increments the count and disables both buttons', async ({ page }) => {
  await page.goto('/');

  const upBtn = page.getByRole('button', { name: 'Thumbs up for Alice Nguyen' });
  const downBtn = page.getByRole('button', { name: 'Thumbs down for Alice Nguyen' });

  await expect(upBtn).toBeVisible();
  const countText = await upBtn.locator('span.font-mono').textContent();
  const countBefore = parseInt(countText ?? '0', 10);

  await upBtn.click();

  await expect(upBtn.locator('span.font-mono')).toHaveText(String(countBefore + 1), {
    timeout: 3000,
  });
  await expect(upBtn).toBeDisabled();
  await expect(downBtn).toBeDisabled();
});

test('tally counts survive a page reload', async ({ page }) => {
  await page.goto('/');

  const upBtn = page.getByRole('button', { name: 'Thumbs up for Ben Okafor' });
  await expect(upBtn).toBeVisible();

  const countText = await upBtn.locator('span.font-mono').textContent();
  const countBefore = parseInt(countText ?? '0', 10);

  await upBtn.click();
  await expect(upBtn.locator('span.font-mono')).toHaveText(String(countBefore + 1), {
    timeout: 3000,
  });

  await page.reload();

  const upBtnAfterReload = page.getByRole('button', { name: 'Thumbs up for Ben Okafor' });
  await expect(upBtnAfterReload.locator('span.font-mono')).toHaveText(
    String(countBefore + 1),
    { timeout: 3000 },
  );
});
