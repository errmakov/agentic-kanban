import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

function mockFetch(state: { endsAt: number | null; status: string }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () => Promise.resolve(state),
    }),
  );
}

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the + Countdown button when idle', async () => {
    mockFetch({ endsAt: null, status: 'idle' });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
    });
  });

  it('renders an MM:SS display when a timer is running', async () => {
    mockFetch({ endsAt: Date.now() + 90_000, status: 'running' });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
    });
  });

  it('renders "Time\'s up!" when the timer is expired', async () => {
    mockFetch({ endsAt: Date.now() - 1000, status: 'expired' });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByText(/time's up/i)).toBeInTheDocument();
    });
  });
});
