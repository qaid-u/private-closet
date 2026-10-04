import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StyleProfileWizard } from '../src/features/style-profile/StyleProfileWizard';
import { SelfieCheckModal } from '../src/features/style-profile/SelfieCheckModal';
import { StyleScreen } from '../src/features/style-profile/StyleScreen';
import { styleProfileRepo } from '../src/data/repositories/styleProfileRepo';
import { db } from '../src/data/db';

describe('Phase 3: Style Profile & Onboarding Unit Tests', () => {
  beforeEach(async () => {
    await db.styleProfiles.clear();
    await db.items.clear();
  });

  it('renders StyleProfileWizard and navigates through steps', async () => {
    const handleComplete = vi.fn();
    const handleCancel = vi.fn();

    render(
      <StyleProfileWizard
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    );

    // Step 1: Skin Depth & Undertone
    expect(screen.getByText(/Skin Depth & Undertone/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 8/i)).toBeInTheDocument();

    // Select skin depth
    const deepBtn = screen.getByRole('button', { name: /^deep$/i });
    fireEvent.click(deepBtn);

    // Click Continue
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);

    // Step 2: Hair Color & Texture
    expect(screen.getByText(/Hair Color & Texture/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 8/i)).toBeInTheDocument();

    // Skip to next step
    const skipBtn = screen.getByRole('button', { name: /skip step/i });
    fireEvent.click(skipBtn);

    // Step 3: Face Shape
    expect(screen.getByText(/Face Shape/i)).toBeInTheDocument();
    const roundShapeBtn = screen.getByRole('button', { name: /round/i });
    fireEvent.click(roundShapeBtn);
  });

  it('simulates selfie color check, shows guidance, and verifies photo disposal', async () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();

    render(
      <SelfieCheckModal
        isOpen={true}
        onClose={handleClose}
        onApplyResults={handleApply}
      />
    );

    // Guidance text
    expect(screen.getByText(/Zero Photo Storage Promise/i)).toBeInTheDocument();
    expect(screen.getByText(/Lighting Guidance/i)).toBeInTheDocument();

    // Proceed to camera
    const cameraBtn = screen.getByRole('button', { name: /continue to camera/i });
    fireEvent.click(cameraBtn);

    // Camera guide viewfinder
    expect(screen.getByText(/Align face inside oval/i)).toBeInTheDocument();

    // Simulate capture
    const captureBtn = screen.getByRole('button', { name: /take photo/i });
    fireEvent.click(captureBtn);

    // Wait for analysis results
    await waitFor(() => {
      expect(screen.getByText(/Photo Purged from RAM/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Save style values
    const saveValuesBtn = screen.getByRole('button', { name: /save style values/i });
    fireEvent.click(saveValuesBtn);

    expect(handleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        depth: expect.any(String),
        undertone: expect.any(String),
        faceShape: expect.any(String),
      })
    );

    // Verified photo deleted banner
    expect(screen.getByText(/Photo Deleted. Values Saved./i)).toBeInTheDocument();
  });

  it('renders StyleScreen and displays empty state then profile after save', async () => {
    render(<StyleScreen />);

    // Initial empty state
    await waitFor(() => {
      expect(screen.getByText(/No Style Profile Set Up Yet/i)).toBeInTheDocument();
    });

    // Save a profile directly via repo
    await styleProfileRepo.saveProfile({
      id: 'current',
      skin: { depth: 'medium', swatchHex: '#D8A07A', undertone: 'warm', source: 'manual' },
      hair: { colorHex: '#3B2F2F', colorName: 'Dark Brown', length: 'medium', texture: 'wavy' },
      faceShape: 'oval',
      heightCm: 175,
      heightUnit: 'cm',
      proportions: ['broad-shoulders'],
      fitPreference: 0.6,
      comfortRules: [{ id: 'no-skinny', label: 'No skinny fits', kind: 'builtin' }],
      completeness: 85,
      updatedAt: Date.now(),
    });

    // Rerender to observe live profile display
    render(<StyleScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Your Style Profile/i)).toBeInTheDocument();
      expect(screen.getByText(/85%/i)).toBeInTheDocument();
      expect(screen.getByText(/No skinny fits/i)).toBeInTheDocument();
    });
  });
});
