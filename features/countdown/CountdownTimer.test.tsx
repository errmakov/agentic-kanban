import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

function mockFetch(state: unknown) {
  return vi.fn().mockResolvedValue({
    json: async () => state,
  });
}

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('shows the setup form when idle', async () => {
    global.fetch = mockFetch({ status: 'idle' });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  it('shows the running countdown when active', async () => {
    global.fetch = mockFetch({
      status: 'running',
      durationSeconds: 120,
      startedAt: new Date().toISOString(),
    });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByLabelText(/time remaining/i)).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText('MM:SS')).not.toBeInTheDocument();
  });

  it("shows the Time's up state when the timer has expired", async () => {
    global.fetch = mockFetch({
      status: 'running',
      durationSeconds: 5,
      startedAt: new Date(Date.now() - 10_000).toISOString(),
    });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByText(/time's up/i)).toBeInTheDocument();
    });
  });
});
