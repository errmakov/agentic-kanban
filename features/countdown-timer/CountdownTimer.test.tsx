import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import feature from './index';

const CountdownTimer = feature.Component;

type State = { startedAt: number | null; durationSeconds: number };

function mockFetch(state: State) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(state) })),
  );
}

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the MM:SS start form when idle', async () => {
    mockFetch({ startedAt: null, durationSeconds: 0 });
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: /countdown/i }),
    ).toBeInTheDocument();
  });

  it('shows a ticking MM:SS display when a timer is running', async () => {
    const startedAt = Date.now();
    mockFetch({ startedAt, durationSeconds: 120 });
    render(<CountdownTimer />);
    const display = await screen.findByLabelText('Time remaining');
    expect(display.textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it('shows "Time\'s up!" when the timer has elapsed', async () => {
    mockFetch({ startedAt: Date.now() - 61000, durationSeconds: 60 });
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByText(/time's up/i)).toBeInTheDocument(),
    );
  });
});
