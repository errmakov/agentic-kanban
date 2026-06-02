import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

  it("renders \"Time's up!\" when the timer is expired", async () => {
    mockFetch({ endsAt: Date.now() - 1000, status: 'expired' });
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByText(/time's up/i)).toBeInTheDocument();
    });
  });

  it('shows setup form with MM/SS inputs after clicking + Countdown', async () => {
    mockFetch({ endsAt: null, status: 'idle' });
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+ countdown/i }));
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
  });

  it('disables Start button when both minutes and seconds are 0', async () => {
    mockFetch({ endsAt: null, status: 'idle' });
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+ countdown/i }));
    expect(screen.getByRole('button', { name: /^start$/i })).toBeDisabled();
  });

  it('shows validation message and disables Start when seconds exceed 59', async () => {
    mockFetch({ endsAt: null, status: 'idle' });
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '60' } });
    expect(screen.getByText(/seconds must be between 0 and 59/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^start$/i })).toBeDisabled();
  });

  it('enables Start button when a valid duration is entered', async () => {
    mockFetch({ endsAt: null, status: 'idle' });
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '1' } });
    expect(screen.getByRole('button', { name: /^start$/i })).not.toBeDisabled();
  });

  it('Cancel button returns to idle view', async () => {
    mockFetch({ endsAt: null, status: 'idle' });
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(screen.getByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  it('starting a timer calls POST and transitions to running view', async () => {
    const endsAt = Date.now() + 90_000;
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: null, status: 'idle' }) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt, status: 'running' }) }),
    );
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.click(screen.getByRole('button', { name: /\+ countdown/i }));
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }));
    await waitFor(() => {
      expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
    });
  });

  it('Reset from running view calls POST and returns to idle', async () => {
    const endsAt = Date.now() + 90_000;
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt, status: 'running' }) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: null, status: 'idle' }) }),
    );
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /reset/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
    });
  });

  it('Reset from expired view calls POST and returns to idle', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: Date.now() - 1000, status: 'expired' }) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: null, status: 'idle' }) }),
    );
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /reset/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
    });
  });

  it('falls back to idle when the initial fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
    });
  });
});
