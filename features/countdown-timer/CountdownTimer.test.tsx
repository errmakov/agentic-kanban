import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

function mockState(state: {
  status: 'idle' | 'running' | 'finished';
  durationMs: number;
  startedAt: number;
}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ json: () => Promise.resolve(state) })),
  );
}

describe('CountdownTimer', () => {
  beforeEach(() => {
    mockState({ status: 'idle', durationMs: 0, startedAt: 0 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the minute and second inputs in idle state', async () => {
    render(<CountdownTimer />);
    expect(await screen.findByLabelText('minutes')).toBeInTheDocument();
    expect(screen.getByLabelText('seconds')).toBeInTheDocument();
  });

  it('disables Start when minutes and seconds are both 0', async () => {
    render(<CountdownTimer />);
    const start = await screen.findByRole('button', { name: /start/i });
    expect(start).toBeDisabled();
  });

  it('shows the running display when state is running', async () => {
    mockState({ status: 'running', durationMs: 90_000, startedAt: Date.now() });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByLabelText('time remaining')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('time remaining').textContent).toMatch(/^0[01]:\d{2}$/);
  });

  it("shows Time's up when state is finished", async () => {
    mockState({ status: 'finished', durationMs: 60_000, startedAt: 0 });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByText(/time's up/i)).toBeInTheDocument();
    });
  });
});
