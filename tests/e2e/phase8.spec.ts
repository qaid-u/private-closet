import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Qaid Uqail/.gemini/antigravity-ide/brain/b83c46d5-3854-44c4-9b40-8b171e6cb2b7';

test.describe('Phase 8: PWA, Offline, System States & Performance Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Seed initial onboarding completion
    await page.addInitScript(() => {
      localStorage.setItem('pc_onboarding_done', 'true');
    });
  });

  test('Desktop (1280x800) - Offline banner, PWA install banner, and App & Storage section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://127.0.0.1:5173/');

    // Verify app loaded with PWA banner
    await expect(page.getByText(/install private closet/i)).toBeVisible();

    // 1. Emulate going offline
    await page.context().setOffline(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Verify offline banner appears per SPEC Section 11
    const offlineBanner = page.getByRole('status').filter({ hasText: /you're offline\. everything still works\./i });
    await expect(offlineBanner).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase8_offline_desktop_light.png'), fullPage: false });

    // Re-enable online
    await page.context().setOffline(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });

    // 2. Navigate to Me -> App & Storage using nav ID
    const meBtn = page.locator('#rail-nav-me, #bottom-nav-me').first();
    await meBtn.click();
    await page.waitForTimeout(300);

    const storageTab = page.getByRole('button', { name: /app & storage/i });
    await expect(storageTab).toBeVisible();
    await storageTab.click();

    await expect(page.getByText(/offline app & device storage/i)).toBeVisible();
    await expect(page.getByText(/local storage allocation/i)).toBeVisible();
    await expect(page.getByText(/persistent storage protection/i)).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase8_storage_desktop_light.png'), fullPage: false });

    // 3. Dark mode snapshot
    const darkToggle = page.getByRole('button', { name: /switch to dark mode/i }).first();
    if (await darkToggle.isVisible()) {
      await darkToggle.click();
    } else {
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pc_theme', 'dark');
      });
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase8_storage_desktop_dark.png'), fullPage: false });
  });

  test('Tablet (768x1024) - Offline behavior and storage layout in Dark Mode', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.addInitScript(() => {
      localStorage.setItem('pc_theme', 'dark');
      document.documentElement.classList.add('dark');
    });

    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(500);

    // Simulate going offline
    await page.context().setOffline(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const offlineBanner = page.getByRole('status').filter({ hasText: /you're offline\. everything still works\./i });
    await expect(offlineBanner).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase8_tablet_dark.png'), fullPage: false });

    await page.context().setOffline(false);
  });

  test('Mobile (390x844) - Offline banner and Mobile PWA install modal in Light and Dark Mode', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:5173/');

    // Click install to open guidance modal
    const installBtn = page.getByRole('button', { name: /^install$/i });
    if (await installBtn.isVisible()) {
      await installBtn.click();
      await expect(page.getByRole('heading', { name: /install to home screen/i })).toBeVisible();
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase8_mobile_light.png'), fullPage: false });
      await page.getByRole('button', { name: /got it/i }).click();
    }

    // Go offline on mobile
    await page.context().setOffline(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const offlineBanner = page.getByRole('status').filter({ hasText: /you're offline\. everything still works\./i });
    await expect(offlineBanner).toBeVisible();

    // Toggle dark mode
    await page.getByRole('button', { name: /switch to dark mode/i }).first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'phase8_mobile_dark.png'), fullPage: false });

    await page.context().setOffline(false);
  });
});
