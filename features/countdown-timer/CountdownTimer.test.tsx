import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import feature from './index';

const Countdown = feature.Component;

function mockFetch(endsAt: number | null) {
  return vi.fn(async () => ({
    ok: true,
    json: async () => ({ endsAt }),
  })) as unknown as typeof fetch;
}

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the "+ Countdown" button when idle', async () => {
    vi.stubGlobal('fetch', mockFetch(null));
    render(<Countdown />);
    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  it('opens the MM/SS setup form after clicking "+ Countdown"', async () => {
    vi.stubGlobal('fetch', mockFetch(null));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    expect(screen.getByLabelText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seconds/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('shows a formatted MM:SS countdown when a future timer is active', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
    vi.stubGlobal('fetch', mockFetch(Date.now() + 90_000)); // 1:30 remaining
    render(<Countdown />);
    await vi.waitFor(() => {
      expect(screen.getByText('01:30')).toBeInTheDocument();
    });
  });

  it('shows "Time\'s up" when the timer end is in the past', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
    vi.stubGlobal('fetch', mockFetch(Date.now() - 1000));
    render(<Countdown />);
    await vi.waitFor(() => {
      expect(screen.getByText(/time's up/i)).toBeInTheDocument();
    });
  });
});
