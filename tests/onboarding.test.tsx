import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingFlow } from '../src/features/onboarding/OnboardingFlow';
import { db } from '../src/data/db';

describe('OnboardingFlow Component Tests', () => {
  beforeEach(async () => {
    await db.items.clear();
    await db.styleProfiles.clear();
  });

  it('renders welcome screen and progresses to privacy promise', () => {
    const handleComplete = vi.fn();
    const handleSkip = vi.fn();

    render(
      <OnboardingFlow
        onComplete={handleComplete}
        onSkipToApp={handleSkip}
      />
    );

    expect(screen.getByText(/What should I wear today\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Cloud/i)).toBeInTheDocument();

    const beginBtn = screen.getByRole('button', { name: /begin guided setup/i });
    fireEvent.click(beginBtn);

    expect(screen.getByText(/Our Privacy Promise/i)).toBeInTheDocument();
    expect(screen.getByText(/No Data Leaves This Device/i)).toBeInTheDocument();
  });

  it('allows skipping to app directly from welcome screen', () => {
    const handleComplete = vi.fn();
    const handleSkip = vi.fn();

    render(
      <OnboardingFlow
        onComplete={handleComplete}
        onSkipToApp={handleSkip}
      />
    );

    const exploreBtn = screen.getByRole('button', { name: /explore app directly/i });
    fireEvent.click(exploreBtn);

    expect(handleSkip).toHaveBeenCalled();
  });
});
