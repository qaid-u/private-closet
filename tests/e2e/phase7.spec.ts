import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Qaid Uqail/.gemini/antigravity-ide/brain/b83c46d5-3854-44c4-9b40-8b171e6cb2b7';

test.describe('Phase 7: Me Screen, Privacy Center, Backup, and Wardrobe Intelligence E2E', () => {
  test('tests privacy center, ai models, backup & restore, wear calendar, insights, and responsive captures', async ({ page }) => {
    // 1. Initial Launch: Desktop Viewport Light Mode
    await page.setViewportSize({ width: 1280, height: 800 });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    await page.addInitScript(() => {
      localStorage.setItem('pc_onboarding_done', 'true');
    });
    await page.goto('http://127.0.0.1:5173/');

    // Ensure sample closet is seeded
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

    // Navigate to Me tab
    const meNavBtn = page.locator('#rail-nav-me');
    await meNavBtn.click();
    await page.waitForTimeout(300);

    // Verify Privacy Center Hero & 0 bytes sent
    await expect(page.getByRole('heading', { name: /control & privacy/i })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=0 bytes')).toBeVisible();
    await expect(page.getByRole('heading', { name: /outgoing network registry/i })).toBeVisible();

    // 1. Capture Privacy Center Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_privacy_desktop_light.png'),
      fullPage: false,
    });

    // 2. Switch to AI Models Section
    const modelsTabBtn = page.getByRole('button', { name: /ai models/i });
    await modelsTabBtn.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('heading', { name: /on-device ai models/i })).toBeVisible();
    await expect(page.locator('text=Device Storage Breakdown')).toBeVisible();
    await expect(page.locator('text=Pixel K-Means Color Extractor')).toBeVisible();

    // 2. Capture AI Models Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_models_desktop_light.png'),
      fullPage: false,
    });

    // 3. Switch to Backup & Restore Section
    const backupTabBtn = page.getByRole('button', { name: /backup & restore/i });
    await backupTabBtn.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('heading', { name: /encrypted backup & restore/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export encrypted backup/i })).toBeVisible();

    // Open export modal
    const exportBtn = page.getByRole('button', { name: /export encrypted backup/i });
    await exportBtn.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('heading', { name: /export encrypted backup/i })).toBeVisible();

    // 3. Capture Backup Modal Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_backup_desktop_light.png'),
      fullPage: false,
    });

    // Close export modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 4. Switch to Style Data Section
    const styleDataTabBtn = page.getByRole('button', { name: /style data/i });
    await styleDataTabBtn.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('heading', { name: /style profile data/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete only style data/i })).toBeVisible();

    // 4. Capture Style Data Section Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_styledata_desktop_light.png'),
      fullPage: false,
    });

    // 5. Navigate to Style Tab -> Wear Calendar (Log)
    const styleNavBtn = page.locator('#rail-nav-style');
    await styleNavBtn.click();
    await page.waitForTimeout(300);

    const logTab = page.getByRole('button', { name: /^log$/i });
    await logTab.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('heading', { name: /wear calendar & history/i })).toBeVisible();
    await expect(page.locator('text=Days Logged').first()).toBeVisible();

    // 5. Capture Wear Calendar Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_calendar_desktop_light.png'),
      fullPage: false,
    });

    // 6. Switch to Insights segment
    const insightsTab = page.getByRole('button', { name: /^insights$/i });
    await insightsTab.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('heading', { name: /wardrobe insights & analytics/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /cost-per-wear heroes/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /smart wardrobe gap analysis/i })).toBeVisible();

    // 6. Capture Wardrobe Insights Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_insights_desktop_light.png'),
      fullPage: false,
    });

    // 7. Switch to Plan segment
    const planTab = page.getByRole('button', { name: /^plan$/i });
    await planTab.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('heading', { name: /wardrobe planners/i })).toBeVisible();
    await expect(page.locator('text=7-Day Outfit Schedule')).toBeVisible();

    // 7. Capture Wardrobe Planner Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_planner_desktop_light.png'),
      fullPage: false,
    });

    // Return to Me tab for Dark mode and responsive captures
    await meNavBtn.click();
    await page.waitForTimeout(300);

    // 8. Desktop Dark Mode
    const themeBtn = page.getByRole('button', { name: /switch to dark mode/i });
    await themeBtn.click();
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_me_desktop_dark.png'),
      fullPage: false,
    });

    // 9. Tablet Dark Mode (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_tablet_dark.png'),
      fullPage: false,
    });

    // 10. Mobile Dark Mode (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_mobile_dark.png'),
      fullPage: false,
    });

    // 11. Mobile Light Mode (390x844)
    const mobileThemeBtn = page.getByRole('button', { name: /switch to light mode/i });
    await mobileThemeBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase7_mobile_light.png'),
      fullPage: false,
    });
  });
});
