import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('attendee counter shows watching indicator in header', async ({ page }) => {
  await page.goto('/');
  // The component renders "– watching" immediately as a placeholder before the first API response.
  await expect(page.getByText(/watching/)).toBeVisible();
});

test('FAQ accordion renders all questions collapsed by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();
  const buttons = page.getByRole('button', { name: /What is FactoryWall\?/ });
  await expect(buttons).toHaveAttribute('aria-expanded', 'false');
});

test('FAQ accordion expands an answer on click and collapses on second click', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: /What is FactoryWall\?/ });
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/live session companion/i)).toBeVisible();

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText(/live session companion/i)).toBeHidden();
});

test('FAQ accordion opens only one answer at a time', async ({ page }) => {
  await page.goto('/');
  const first = page.getByRole('button', { name: /What is FactoryWall\?/ });
  const second = page.getByRole('button', { name: /How do I send a reaction\?/ });

  await first.click();
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'false');

  await second.click();
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
});

test('speaker bio cards section is visible with names and roles', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /speakers/i })).toBeVisible();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await expect(page.getByText('Grace Hopper')).toBeVisible();
  await expect(page.getByText('Alan Turing')).toBeVisible();
  await expect(page.getByText('Keynote Speaker')).toBeVisible();
});
