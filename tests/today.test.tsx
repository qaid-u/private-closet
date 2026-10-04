import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodayScreen } from '../src/features/today/TodayScreen';
import { db } from '../src/data/db';
import { seedSampleData } from '../src/data/seedService';
import { wearLogsRepo } from '../src/data/repositories/wearLogsRepo';

describe('Phase 5: Today Screen & Recommendation Flows', () => {
  beforeEach(async () => {
    await db.items.clear();
    await db.styleProfiles.clear();
    await db.preferences.clear();
    await db.wearLogs.clear();
    await db.feedback.clear();
    await seedSampleData();
  });

  it('renders TodayScreen with header, greeting, weather chip, and recommendations', async () => {
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>
    );

    // Header greeting
    await waitFor(() => {
      expect(screen.getByText(/good morning/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/on device/i)).toBeInTheDocument();
    expect(screen.getByText(/18°c, rain/i)).toBeInTheDocument();

    // Recommendation card title and match badge
    await waitFor(() => {
      expect(screen.getByText(/recommendation 1 of/i)).toBeInTheDocument();
      expect(screen.getByText(/match/i)).toBeInTheDocument();
    });

    // Action buttons
    expect(screen.getByRole('button', { name: /wear this today/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /swap an item/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /not me/i })).toBeInTheDocument();
  });

  it('opens Style Match sheet and displays factor breakdowns', async () => {
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/match/i)).toBeInTheDocument();
    });

    // Click Match indicator
    const matchBtn = screen.getByText(/match/i);
    fireEvent.click(matchBtn);

    // Style match sheet opens
    await waitFor(() => {
      expect(screen.getByText(/why this outfit works for you/i)).toBeInTheDocument();
      expect(screen.getByText(/color harmony/i)).toBeInTheDocument();
      expect(screen.getByText(/proportion & silhouette/i)).toBeInTheDocument();
      expect(screen.getByText(/these are suggestions/i)).toBeInTheDocument();
    });
  });

  it('logs wear when "Wear this today" is clicked', async () => {
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /wear this today/i })).toBeInTheDocument();
    });

    const wearBtn = screen.getByRole('button', { name: /wear this today/i });
    fireEvent.click(wearBtn);

    await waitFor(async () => {
      const logs = await wearLogsRepo.listRecent(5);
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  it('opens Not Me sheet and records feedback', async () => {
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /not me/i })).toBeInTheDocument();
    });

    const notMeBtn = screen.getByRole('button', { name: /not me/i });
    fireEvent.click(notMeBtn);

    await waitFor(() => {
      expect(screen.getByText(/not quite you today/i)).toBeInTheDocument();
      expect(screen.getByText(/wrong colors/i)).toBeInTheDocument();
    });

    // Select reason and submit
    fireEvent.click(screen.getByText(/wrong colors/i));
    const submitBtn = screen.getByRole('button', { name: /save & refresh outfit/i });
    fireEvent.click(submitBtn);

    await waitFor(async () => {
      const fbCount = await db.feedback.count();
      expect(fbCount).toBeGreaterThan(0);
    });
  });

  it('opens Tune Picks sheet and updates weather/occasion criteria', async () => {
    render(
      <MemoryRouter>
        <TodayScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/18°c, rain/i)).toBeInTheDocument();
    });

    // Click weather chip to open tune sheet
    const weatherBtn = screen.getByText(/18°c, rain/i).closest('button');
    expect(weatherBtn).not.toBeNull();
    fireEvent.click(weatherBtn!);

    await waitFor(() => {
      expect(screen.getByText(/tune today's picks/i)).toBeInTheDocument();
      expect(screen.getByText(/describe what you need/i)).toBeInTheDocument();
    });

    // Change to Sunny
    fireEvent.click(screen.getByRole('button', { name: /sunny/i }));
    fireEvent.click(screen.getByRole('button', { name: /apply changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/sunny/i)).toBeInTheDocument();
    });
  });
});
