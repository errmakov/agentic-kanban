import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

function mockFetch(endTime: number | null) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ endTime }),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CountdownTimer', () => {
  it('renders the +Countdown button when idle', async () => {
    mockFetch(null);
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /\+countdown/i }),
      ).toBeInTheDocument(),
    );
  });

  it('renders MM:SS when running', async () => {
    mockFetch(Date.now() + 60_000);
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument(),
    );
  });

  it("renders Time's up when expired", async () => {
    mockFetch(Date.now() - 1);
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByText(/time's up/i)).toBeInTheDocument(),
    );
  });
});
