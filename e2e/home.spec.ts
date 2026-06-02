import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('header shows a live attendee counter', async ({ page }) => {
  await page.goto('/');
  const counter = page.getByText(/viewing/);
  await expect(counter).toBeVisible();
});

test('FAQ section heading is visible on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
});

test('clicking a FAQ question expands its answer', async ({ page }) => {
  await page.goto('/');
  const summary = page.getByText('What is FactoryWall?');
  const details = page.locator('details').filter({ has: summary });
  await expect(details).not.toHaveAttribute('open');
  await summary.click();
  await expect(details).toHaveAttribute('open');
  await expect(page.getByText(/a web app built on stage during the workshop/i)).toBeVisible();
});

test('clicking an expanded FAQ question collapses it', async ({ page }) => {
  await page.goto('/');
  const summary = page.getByText('What is FactoryWall?');
  const details = page.locator('details').filter({ has: summary });
  await summary.click();
  await expect(details).toHaveAttribute('open');
  await summary.click();
  await expect(details).not.toHaveAttribute('open');
});

test('multiple FAQ items can be open simultaneously', async ({ page }) => {
  await page.goto('/');
  await page.getByText('What is FactoryWall?').click();
  await page.getByText('How are features built?').click();
  const allDetails = page.locator('section[aria-labelledby="faq-heading"] details');
  await expect(allDetails.nth(0)).toHaveAttribute('open');
  await expect(allDetails.nth(1)).toHaveAttribute('open');
});
