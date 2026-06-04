import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import countdown from './index';

const Countdown = countdown.Component;

function mockFetch(state: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => state })) as unknown as typeof fetch,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Countdown', () => {
  it('shows the +Countdown button when idle', async () => {
    mockFetch({ state: 'idle' });
    await act(async () => {
      render(<Countdown />);
    });
    expect(screen.getByRole('button', { name: '+Countdown' })).toBeInTheDocument();
  });

  it('shows "Time\'s up!" when finished', async () => {
    mockFetch({ state: 'finished' });
    await act(async () => {
      render(<Countdown />);
    });
    expect(screen.getByText(/time's up/i)).toBeInTheDocument();
  });

  it('renders a MM:SS time string when running', async () => {
    mockFetch({ state: 'running', endsAt: Date.now() + 60_000 });
    await act(async () => {
      render(<Countdown />);
    });
    expect(screen.getByLabelText('time remaining').textContent).toMatch(/^\d{2}:\d{2}$/);
  });
});
