import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import feature from './index';

const Countdown = feature.Component;

function mockFetch(endsAt: number | null) {
  return vi.fn(async () => ({
    ok: true,
    json: async () => ({ endsAt }),
  })) as unknown as typeof fetch;
}

// Mock supporting different responses per HTTP method (GET vs POST/DELETE).
function mockFetchWithActions(
  initialEndsAt: number | null,
  actionResponse: { endsAt: number | null } = { endsAt: null },
) {
  return vi.fn(async (_url: string, opts?: RequestInit) => {
    const method = opts?.method ?? 'GET';
    if (method === 'GET') {
      return { ok: true, json: async () => ({ endsAt: initialEndsAt }) };
    }
    return { ok: true, json: async () => actionResponse };
  }) as unknown as typeof fetch;
}

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ── Idle state ─────────────────────────────────────────────────────────────

  it('renders the "+ Countdown" button when idle', async () => {
    vi.stubGlobal('fetch', mockFetch(null));
    render(<Countdown />);
    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  it('opens the MM/SS setup form after clicking "+ Countdown"', async () => {
    vi.stubGlobal('fetch', mockFetch(null));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    expect(screen.getByLabelText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seconds/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('closes the setup form when the form Cancel button is clicked', async () => {
    vi.stubGlobal('fetch', mockFetch(null));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    expect(screen.getByLabelText(/minutes/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/minutes/i)).not.toBeInTheDocument();
  });

  it('disables the Start button when both inputs are zero', async () => {
    vi.stubGlobal('fetch', mockFetch(null));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    const minsInput = screen.getByLabelText(/minutes/i);
    const secsInput = screen.getByLabelText(/seconds/i);
    fireEvent.change(minsInput, { target: { value: '0' } });
    fireEvent.change(secsInput, { target: { value: '0' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('keeps Start enabled when duration is at least 1 second', async () => {
    vi.stubGlobal('fetch', mockFetch(null));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    const minsInput = screen.getByLabelText(/minutes/i);
    const secsInput = screen.getByLabelText(/seconds/i);
    fireEvent.change(minsInput, { target: { value: '0' } });
    fireEvent.change(secsInput, { target: { value: '1' } });
    expect(screen.getByRole('button', { name: /start/i })).not.toBeDisabled();
  });

  it('POSTs to the API on Start and transitions to running state', async () => {
    // Real timers: Date.now() + 300_000 is genuinely future so no fake timer needed.
    const futureEndsAt = Date.now() + 300_000; // 5 minutes from now
    const fetchMock = mockFetchWithActions(null, { endsAt: futureEndsAt });
    vi.stubGlobal('fetch', fetchMock);

    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));

    const minsInput = screen.getByLabelText(/minutes/i);
    const secsInput = screen.getByLabelText(/seconds/i);
    fireEvent.change(minsInput, { target: { value: '5' } });
    fireEvent.change(secsInput, { target: { value: '0' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/countdown-timer',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(await screen.findByText('05:00')).toBeInTheDocument();
  });

  // ── Running state ───────────────────────────────────────────────────────────

  it('shows a formatted MM:SS countdown when a future timer is active', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
    vi.stubGlobal('fetch', mockFetch(Date.now() + 90_000)); // 1:30 remaining
    render(<Countdown />);
    await vi.waitFor(() => {
      expect(screen.getByText('01:30')).toBeInTheDocument();
    });
  });

  it('shows 99:59 correctly for the maximum duration', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
    vi.stubGlobal('fetch', mockFetch(Date.now() + 5_999_000)); // 99:59
    render(<Countdown />);
    await vi.waitFor(() => {
      expect(screen.getByText('99:59')).toBeInTheDocument();
    });
  });

  it('shows a Cancel button in running state', async () => {
    // Real timers: Date.now() + 60_000 is genuinely future.
    vi.stubGlobal('fetch', mockFetch(Date.now() + 60_000));
    render(<Countdown />);
    expect(await screen.findByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls DELETE and returns to idle when Cancel is clicked on a running timer', async () => {
    const fetchMock = mockFetchWithActions(Date.now() + 60_000, { endsAt: null });
    vi.stubGlobal('fetch', fetchMock);
    render(<Countdown />);

    const cancelBtn = await screen.findByRole('button', { name: /cancel/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/countdown-timer',
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  // ── Finished state ──────────────────────────────────────────────────────────

  it('shows "Time\'s up" when the timer end is in the past', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T00:00:00Z'));
    vi.stubGlobal('fetch', mockFetch(Date.now() - 1000));
    render(<Countdown />);
    await vi.waitFor(() => {
      expect(screen.getByText(/time's up/i)).toBeInTheDocument();
    });
  });

  it('shows a Reset button in the finished state', async () => {
    // Real timers: Date.now() - 1000 is genuinely past.
    vi.stubGlobal('fetch', mockFetch(Date.now() - 1000));
    render(<Countdown />);
    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls DELETE and returns to idle when Reset is clicked on a finished timer', async () => {
    const fetchMock = mockFetchWithActions(Date.now() - 1000, { endsAt: null });
    vi.stubGlobal('fetch', fetchMock);
    render(<Countdown />);

    const resetBtn = await screen.findByRole('button', { name: /reset/i });
    await act(async () => {
      fireEvent.click(resetBtn);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/countdown-timer',
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  // ── Feature descriptor ──────────────────────────────────────────────────────

  it('registers with the correct feature descriptor', () => {
    expect(feature.id).toBe('countdown-timer');
    expect(feature.slot).toBe('main');
    expect(typeof feature.order).toBe('number');
    expect(feature.Component).toBe(Countdown);
  });
});
