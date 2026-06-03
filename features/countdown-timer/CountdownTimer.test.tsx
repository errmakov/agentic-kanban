import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

function mockFetch(endsAt: string | null) {
  const status = !endsAt
    ? 'idle'
    : new Date(endsAt).getTime() - Date.now() > 0
    ? 'running'
    : 'done';
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ endsAt, status }),
      }),
    ),
  );
}

beforeEach(() => {
  vi.useRealTimers();
});

describe('CountdownTimer', () => {
  it('shows idle state with inputs and start button', async () => {
    mockFetch(null);
    render(<CountdownTimer />);
    expect(await screen.findByText('Start Countdown')).toBeInTheDocument();
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
    expect(screen.queryByText(/time'?s up/i)).not.toBeInTheDocument();
  });

  it('shows running state with timer display and reset button', async () => {
    const future = new Date(Date.now() + 120_000).toISOString();
    mockFetch(future);
    render(<CountdownTimer />);
    expect(await screen.findByRole('timer')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.queryByText(/time'?s up/i)).not.toBeInTheDocument();
  });

  it('shows done state with "Time\'s up!" message', async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    mockFetch(past);
    render(<CountdownTimer />);
    expect(await screen.findByText(/time'?s up/i)).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});
