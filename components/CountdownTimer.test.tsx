import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

function mockFetch(state: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => state,
    })) as unknown as typeof fetch,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CountdownTimer', () => {
  it('renders the + Countdown trigger when idle', async () => {
    mockFetch({ status: 'idle', endsAt: null });
    render(<CountdownTimer />);
    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  it('renders the "Time\'s up!" state when finished', async () => {
    mockFetch({ status: 'finished', endsAt: Date.now() - 1000 });
    render(<CountdownTimer />);
    expect(await screen.findByText(/time's up!/i)).toBeInTheDocument();
  });

  it('renders a formatted MM:SS time when running', async () => {
    mockFetch({ status: 'running', endsAt: Date.now() + 65_000 });
    render(<CountdownTimer />);
    expect(await screen.findByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
  });
});
