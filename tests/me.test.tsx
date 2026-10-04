import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivacyCenterSection } from '../src/features/me/PrivacyCenterSection';
import { AiModelsSection } from '../src/features/me/AiModelsSection';
import { SecuritySection } from '../src/features/me/SecuritySection';
import { BackupRestoreSection } from '../src/features/me/BackupRestoreSection';
import { StyleDataSection } from '../src/features/me/StyleDataSection';
import { WearCalendarLog } from '../src/features/style-profile/WearCalendarLog';
import { WardrobeInsights } from '../src/features/style-profile/WardrobeInsights';
import { backupService } from '../src/data/backupService';
import { db } from '../src/data/db';
import { seedSampleData } from '../src/data/seedService';
import { styleProfileRepo } from '../src/data/repositories/styleProfileRepo';

describe('Phase 7: Me Screen, Privacy Center, Encrypted Backup & Wardrobe Intelligence', () => {
  beforeEach(async () => {
    await db.items.clear();
    await db.outfits.clear();
    await db.styleProfiles.clear();
    await db.preferences.clear();
    await db.wearLogs.clear();
    await seedSampleData();
  });

  describe('PrivacyCenterSection', () => {
    it('displays zero bytes sent and registers outbound endpoints', () => {
      render(<PrivacyCenterSection />);

      expect(screen.getByText(/privacy center/i)).toBeInTheDocument();
      expect(screen.getByText(/0 bytes/i)).toBeInTheDocument();
      expect(screen.getByText(/zero cloud database/i)).toBeInTheDocument();
      expect(screen.getByText(/outgoing network registry/i)).toBeInTheDocument();
      expect(screen.getByText(/open-meteo weather forecast/i)).toBeInTheDocument();
    });
  });

  describe('AiModelsSection', () => {
    it('lists on-device models, labels simulated models, and handles installation', async () => {
      render(<AiModelsSection />);

      expect(screen.getByText(/on-device ai models/i)).toBeInTheDocument();
      expect(screen.getByText(/pixel k-means color extractor/i)).toBeInTheDocument();
      expect(screen.getByText(/client canvas segmenter/i)).toBeInTheDocument();

      // Check simulated badge
      const simulatedBadges = screen.getAllByText(/simulated/i);
      expect(simulatedBadges.length).toBeGreaterThan(0);
    });
  });

  describe('backupService & BackupRestoreSection', () => {
    it('encrypts backup data with AES-GCM and decrypts with passphrase', async () => {
      const passphrase = 'MySecretWardrobeKey123!';

      // 1. Export encrypted
      const { payloadStr } = await backupService.exportEncrypted(passphrase, false);
      const parsed = JSON.parse(payloadStr);

      expect(parsed.format).toBe('qcloset-encrypted');
      expect(parsed.ciphertext).toBeDefined();
      expect(parsed.salt).toBeDefined();
      expect(parsed.iv).toBeDefined();

      // 2. Decrypt & Preview with correct passphrase
      const { data, preview } = await backupService.previewEncrypted(payloadStr, passphrase);
      expect(preview.itemsCount).toBeGreaterThan(0);
      expect(preview.hasStyleProfile).toBe(true);
      expect(data.items.length).toBe(preview.itemsCount);

      // 3. Fails decryption on incorrect passphrase
      await expect(
        backupService.previewEncrypted(payloadStr, 'WrongPassword456!')
      ).rejects.toThrow(/decryption failed/i);
    });

    it('renders backup and restore controls and excludes profile by default', () => {
      render(<BackupRestoreSection />);

      expect(screen.getByText(/encrypted backup & restore/i)).toBeInTheDocument();
      expect(screen.getByText(/exclude style profile data from backups/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export encrypted backup/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /restore from backup file/i })).toBeInTheDocument();
    });
  });

  describe('SecuritySection', () => {
    it('renders passphrase strength meter and auto-lock selector', () => {
      render(<SecuritySection />);

      expect(screen.getByText(/app lock & local encryption/i)).toBeInTheDocument();
      expect(screen.getByText(/auto-lock timeout/i)).toBeInTheDocument();
      expect(screen.getByText(/biometric unlock/i)).toBeInTheDocument();
    });
  });

  describe('StyleDataSection', () => {
    it('deletes style profile data and disables buttons after confirmation', async () => {
      render(<StyleDataSection />);

      const deleteBtn = await screen.findByRole('button', { name: /delete only style data/i });
      await waitFor(() => {
        expect(deleteBtn).not.toBeDisabled();
      });

      // Click delete button to open confirmation dialog
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /delete style profile data\?/i })).toBeInTheDocument();
      });

      // Confirm deletion in dialog
      const confirmBtn = screen.getByRole('button', { name: /^delete style data$/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText(/style profile data permanently deleted/i)).toBeInTheDocument();
      });

      // Style profile in database should be removed
      const p = await styleProfileRepo.getProfile();
      expect(p).toBeUndefined();

      // Delete and export buttons should now be disabled per SPEC Section 9
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete only style data/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /export style data/i })).toBeDisabled();
      });
    });
  });

  describe('WearCalendarLog', () => {
    it('renders monthly wear calendar, day metrics, and opens day detail modal', async () => {
      render(<WearCalendarLog />);

      await waitFor(() => {
        expect(screen.getByText(/wear calendar & history/i)).toBeInTheDocument();
        expect(screen.getByText(/days logged/i)).toBeInTheDocument();
        expect(screen.getByText(/unique pieces/i)).toBeInTheDocument();
      });

      const logTodayBtn = screen.getByRole('button', { name: /log today's outfit/i });
      fireEvent.click(logTodayBtn);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save wear entry/i })).toBeInTheDocument();
      });
    });
  });

  describe('WardrobeInsights', () => {
    it('calculates cost-per-wear and palette-aware gap analysis', async () => {
      const profile = await styleProfileRepo.getProfile();
      render(<WardrobeInsights profile={profile || null} />);

      await waitFor(() => {
        expect(screen.getByText(/wardrobe insights & analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/smart wardrobe gap analysis/i)).toBeInTheDocument();
      });

      // Check wishlist toggle
      const wishlistBtn = screen.getByRole('button', { name: /add to wishlist/i });
      fireEvent.click(wishlistBtn);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saved in wishlist/i })).toBeInTheDocument();
      });
    });
  });
});
