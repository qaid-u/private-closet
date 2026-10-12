import { test, expect } from '@playwright/test';

test.describe('Phase 0: Shell & Navigation', () => {
  test('renders landing page and app shell navigation', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /your wardrobe/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /good morning/i })).toBeVisible();

    await page.getByRole('link', { name: /closet/i }).first().click();
    await expect(page).toHaveURL(/\/closet$/);
    await expect(page.getByRole('heading', { name: /closet/i })).toBeVisible();

    await page.getByRole('button', { name: /toggle theme/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
