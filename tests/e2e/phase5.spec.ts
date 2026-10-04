import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Qaid Uqail/.gemini/antigravity-ide/brain/b83c46d5-3854-44c4-9b40-8b171e6cb2b7';

test.describe('Phase 5: Recommendation Engine and Today Screen End-to-End Tests', () => {
  test('tests today recommendations, style match sheet, swap sheet, tune sheet, and responsive captures', async ({ page }) => {
    // 1. Initial Launch: Desktop Viewport Light Mode
    await page.setViewportSize({ width: 1280, height: 800 });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    await page.addInitScript(() => {
      localStorage.setItem('pc_onboarding_done', 'true');
    });
    await page.goto('http://127.0.0.1:5173/');

    // Ensure sample closet is seeded if empty
    const recQuery = page.locator('text=Recommendation 1 of').first();
    const sampleBtn = page.getByRole('button', { name: /try with a sample closet/i });

    await Promise.race([
      recQuery.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      sampleBtn.waitFor({ state: 'visible', timeout: 5000 }).then(async () => {
        if (await sampleBtn.isVisible()) {
          await sampleBtn.click();
        }
      }).catch(() => {})
    ]);

    // Verify Today Header
    await expect(page.locator('text=Good morning')).toBeVisible({ timeout: 15000 });

    // Wait for recommendation card to appear
    await expect(page.locator('text=Recommendation 1 of').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Why it works for you:').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /wear this today/i }).first()).toBeVisible();

    // Capture Desktop Light Mode Today Screen
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_today_desktop_light.png'),
      fullPage: false,
    });

    // Test Style Match Sheet: Click match badge
    const matchBadge = page.locator('text=Match').first();
    await matchBadge.click();

    // Verify Style Match Sheet
    await expect(page.locator('text=Why this outfit works for you')).toBeVisible();
    await expect(page.locator('text=Color Harmony')).toBeVisible();
    await expect(page.locator('text=Proportion & Silhouette')).toBeVisible();

    // Capture Style Match Sheet Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_match_desktop_light.png'),
      fullPage: false,
    });

    // Close match sheet
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Test Swap Sheet: Click "Swap an item"
    const swapBtn = page.getByRole('button', { name: /swap an item/i }).first();
    await swapBtn.click();

    // Verify Swap Sheet
    await expect(page.getByRole('heading', { name: 'Swap an item' })).toBeVisible();
    await expect(page.locator('text=Choose piece to swap:')).toBeVisible();

    // Capture Swap Sheet Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_swap_desktop_light.png'),
      fullPage: false,
    });

    // Close swap sheet
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Test Tune Picks Sheet: Click Weather Chip
    const weatherBtn = page.locator('text=Manual · Tune').first();
    await weatherBtn.click();

    // Verify Tune Sheet
    await expect(page.getByRole('heading', { name: /tune today's picks/i })).toBeVisible();
    await expect(page.locator('text=Describe what you need')).toBeVisible();

    // Capture Tune Sheet Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_tune_desktop_light.png'),
      fullPage: false,
    });

    // Close tune sheet
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Test Not Me Sheet: Click "Not me"
    const notMeBtn = page.getByRole('button', { name: /^not me$/i }).first();
    await notMeBtn.click();

    // Verify Not Me Sheet
    await expect(page.getByRole('heading', { name: /not quite you today/i })).toBeVisible();
    await expect(page.locator('text=Wrong colors')).toBeVisible();

    // Capture Not Me Sheet Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_notme_desktop_light.png'),
      fullPage: false,
    });

    // Close not me sheet
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Test "Wear this today" logging
    const wearTodayBtn = page.getByRole('button', { name: /wear this today/i }).first();
    await wearTodayBtn.click();
    await expect(page.locator('text=Outfit logged for today!')).toBeVisible({ timeout: 5000 });

    // Switch to Dark Mode
    const themeBtn = page.getByRole('button', { name: /(light|dark) mode/i }).first();
    await themeBtn.click();
    await page.waitForTimeout(300);

    // Capture Today Screen Desktop Dark
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_today_desktop_dark.png'),
      fullPage: false,
    });

    // 2. Tablet Viewport (768x1024) Dark Mode
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_tablet_dark.png'),
      fullPage: false,
    });

    // 3. Mobile Viewport (390x844) Dark Mode
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_mobile_dark.png'),
      fullPage: false,
    });

    // 4. Mobile Light Mode
    const mobileThemeBtn = page.getByRole('button', { name: /(light|dark) mode/i }).first();
    await mobileThemeBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase5_mobile_light.png'),
      fullPage: false,
    });
  });
});
