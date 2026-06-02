import { test, expect } from '@playwright/test';

test.describe('FeedbackWidget', () => {
  test('widget is visible with label and both buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/how's the session/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thumbs up' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thumbs down' })).toBeVisible();
  });

  test('buttons show numeric counts after the API loads', async ({ page }) => {
    await page.goto('/');
    const upBtn = page.getByRole('button', { name: 'Thumbs up' });
    await expect(upBtn).toBeVisible();
    await expect(upBtn).toHaveText(/\d+/);
    await expect(page.getByRole('button', { name: 'Thumbs down' })).toHaveText(/\d+/);
  });

  test('clicking thumbs up disables both buttons and marks it aria-pressed', async ({ page }) => {
    await page.goto('/');
    const upBtn = page.getByRole('button', { name: 'Thumbs up' });
    const downBtn = page.getByRole('button', { name: 'Thumbs down' });
    await upBtn.click();
    await expect(upBtn).toBeDisabled();
    await expect(downBtn).toBeDisabled();
    await expect(upBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(downBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('clicking thumbs down disables both buttons and marks it aria-pressed', async ({ page }) => {
    await page.goto('/');
    const upBtn = page.getByRole('button', { name: 'Thumbs up' });
    const downBtn = page.getByRole('button', { name: 'Thumbs down' });
    await downBtn.click();
    await expect(upBtn).toBeDisabled();
    await expect(downBtn).toBeDisabled();
    await expect(downBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(upBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('voted state persists across page reload via localStorage', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Thumbs down' }).click();
    await expect(page.getByRole('button', { name: 'Thumbs down' })).toBeDisabled();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Thumbs up' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Thumbs down' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Thumbs down' })).toHaveAttribute('aria-pressed', 'true');
  });
});
