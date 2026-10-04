import { test, expect } from '@playwright/test';

test.describe('Phase 1: Component Library & Dev Showcase', () => {
  test('navigates to /dev/components and tests interactive components', async ({ page }) => {
    await page.goto('/dev/components');

    // Title exists
    await expect(page.locator('text=UI Component Library Showcase')).toBeVisible();

    // Verify badges and why chips
    await expect(page.locator('text=Olive suits your warm undertone').first()).toBeVisible();
    await expect(page.locator('text=Short jacket balances a longer torso').first()).toBeVisible();

    // Test Modal interaction
    const openModalBtn = page.getByRole('button', { name: /open accessible modal/i });
    await openModalBtn.click();
    await expect(page.getByRole('dialog', { name: /accessible modal/i })).toBeVisible();

    // Close modal via Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /accessible modal/i })).not.toBeVisible();

    // Test Sheet interaction
    const openSheetBtn = page.getByRole('button', { name: /open bottom\/slide sheet/i });
    await openSheetBtn.click();
    await expect(page.getByRole('dialog', { name: /item detail sheet/i })).toBeVisible();

    // Close sheet via Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /item detail sheet/i })).not.toBeVisible();

    // Test theme toggle button
    const themeBtn = page.getByRole('button', { name: /(light|dark) mode/i }).first();
    await themeBtn.click();
  });
});
