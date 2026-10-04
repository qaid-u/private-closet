import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OfflineBanner } from '../src/ui/OfflineBanner';
import { StorageAlertBanner } from '../src/ui/StorageAlertBanner';
import { ErrorBoundary } from '../src/ui/ErrorBoundary';
import { ScreenSkeleton } from '../src/ui/ScreenSkeleton';
import { PwaBanner } from '../src/features/pwa/PwaBanner';
import { PwaInstallSection } from '../src/features/me/PwaInstallSection';
import React from 'react';

describe('Phase 8: PWA, Offline, System States & Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OfflineBanner', () => {
    it('displays the exact specified offline reassurance copy', () => {
      render(<OfflineBanner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText("You're offline. Everything still works.")).toBeInTheDocument();
    });

    it('supports custom offline message', () => {
      render(<OfflineBanner message="Custom offline status" />);
      expect(screen.getByText("Custom offline status")).toBeInTheDocument();
    });
  });

  describe('StorageAlertBanner', () => {
    it('alerts user when storage is near full quota', () => {
      const onManageStorage = vi.fn();
      render(
        <StorageAlertBanner
          percentUsed={92}
          usageBytes={460 * 1024 * 1024}
          quotaBytes={500 * 1024 * 1024}
          onManageStorage={onManageStorage}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Storage almost full \(92% used\)/i)).toBeInTheDocument();
      expect(screen.getByText(/460 MB of 500 MB used/i)).toBeInTheDocument();

      const manageBtn = screen.getByRole('button', { name: /manage storage/i });
      fireEvent.click(manageBtn);
      expect(onManageStorage).toHaveBeenCalledTimes(1);
    });

    it('can be dismissed by the user', () => {
      render(
        <StorageAlertBanner
          percentUsed={88}
          usageBytes={880 * 1024 * 1024}
          quotaBytes={1000 * 1024 * 1024}
        />
      );

      const dismissBtn = screen.getByRole('button', { name: /dismiss storage warning/i });
      fireEvent.click(dismissBtn);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('ErrorBoundary', () => {
    it('catches render errors and provides user recovery actions without data leakage', () => {
      const BombComponent: React.FC = () => {
        throw new Error('Simulated component rendering crash');
      };

      // Suppress console.error in vitest during expected crash
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <BombComponent />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/Your data remains safe and secure on your device/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload app/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to today/i })).toBeInTheDocument();

      spy.mockRestore();
    });
  });

  describe('ScreenSkeleton', () => {
    it('renders accessible loading placeholders for each major destination', () => {
      const { rerender } = render(<ScreenSkeleton type="today" />);
      expect(screen.getByLabelText(/loading today's outfit/i)).toBeInTheDocument();

      rerender(<ScreenSkeleton type="closet" />);
      expect(screen.getByLabelText(/loading closet/i)).toBeInTheDocument();

      rerender(<ScreenSkeleton type="style" />);
      expect(screen.getByLabelText(/loading style profile/i)).toBeInTheDocument();

      rerender(<ScreenSkeleton type="me" />);
      expect(screen.getByLabelText(/loading account and settings/i)).toBeInTheDocument();
    });
  });

  describe('PwaBanner', () => {
    it('renders install prompt banner and dismiss action', () => {
      render(<PwaBanner />);
      const banner = screen.getByRole('complementary', { name: /install private closet/i });
      expect(banner).toBeInTheDocument();
      expect(screen.getByText(/works 100% offline with zero cloud storage/i)).toBeInTheDocument();

      const installBtn = screen.getByRole('button', { name: /^install$/i });
      expect(installBtn).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /dismiss install banner/i });
      fireEvent.click(dismissBtn);
      expect(screen.queryByRole('complementary', { name: /install private closet/i })).not.toBeInTheDocument();
    });
  });

  describe('PwaInstallSection', () => {
    it('renders device storage allocation and offline capability guarantee', () => {
      render(<PwaInstallSection />);
      expect(screen.getByText(/offline app & device storage/i)).toBeInTheDocument();
      expect(screen.getByText(/local storage allocation/i)).toBeInTheDocument();
      expect(screen.getByText(/persistent storage protection/i)).toBeInTheDocument();
      expect(screen.getByText(/100% offline capable/i)).toBeInTheDocument();
    });
  });
});
