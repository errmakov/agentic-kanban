import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CountdownTimer } from './index';

function mockFetch(state: object) {
  return vi.fn().mockResolvedValue({
    json: async () => state,
  });
}

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders minute/second inputs and a Start button in idle state', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'idle', endsAt: null, totalSeconds: 0 }),
    );
    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByLabelText(/minutes/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/seconds/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('disables Start when total seconds is 0', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'idle', endsAt: null, totalSeconds: 0 }),
    );
    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
    });
  });

  it('shows "Time\'s up!" when the API reports finished', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'finished', endsAt: null, totalSeconds: 60 }),
    );
    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByText(/time's up!/i)).toBeInTheDocument();
    });
  });
});
