import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from './index';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ endsAt: null, totalSeconds: 0 }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── idle state ────────────────────────────────────────────────────────────

  it('renders the MM:SS input and Start button in the idle state', async () => {
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('disables the Start button when the input is empty', async () => {
    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('disables the Start button for input without a colon', async () => {
    render(<CountdownTimer />);
    await waitFor(() => screen.getByPlaceholderText('MM:SS'));
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), { target: { value: '5' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('disables the Start button for 100:00 (exceeds 99:59)', async () => {
    render(<CountdownTimer />);
    await waitFor(() => screen.getByPlaceholderText('MM:SS'));
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), { target: { value: '100:00' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('disables the Start button for seconds ≥ 60', async () => {
    render(<CountdownTimer />);
    await waitFor(() => screen.getByPlaceholderText('MM:SS'));
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), { target: { value: '01:60' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('disables the Start button for non-numeric input', async () => {
    render(<CountdownTimer />);
    await waitFor(() => screen.getByPlaceholderText('MM:SS'));
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), { target: { value: 'ab:cd' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('enables the Start button for valid input 05:00', async () => {
    render(<CountdownTimer />);
    await waitFor(() => screen.getByPlaceholderText('MM:SS'));
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), { target: { value: '05:00' } });
    expect(screen.getByRole('button', { name: /start/i })).not.toBeDisabled();
  });

  it('enables the Start button for the maximum valid input 99:59', async () => {
    render(<CountdownTimer />);
    await waitFor(() => screen.getByPlaceholderText('MM:SS'));
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), { target: { value: '99:59' } });
    expect(screen.getByRole('button', { name: /start/i })).not.toBeDisabled();
  });

  it('POSTs with correct totalSeconds when Start is clicked', async () => {
    const futureEndsAt = new Date(Date.now() + 300_000).toISOString();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ endsAt: null, totalSeconds: 0 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ endsAt: futureEndsAt, totalSeconds: 300 }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<CountdownTimer />);
    await waitFor(() => screen.getByPlaceholderText('MM:SS'));

    fireEvent.change(screen.getByPlaceholderText('MM:SS'), { target: { value: '05:00' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /start/i }));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/countdown',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ totalSeconds: 300 }),
      }),
    );
  });

  // ── running state ─────────────────────────────────────────────────────────

  it('shows a countdown display and Stop button when endsAt is in the future', async () => {
    const futureEndsAt = new Date(Date.now() + 300_000).toISOString();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ endsAt: futureEndsAt, totalSeconds: 300 }) })));

    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText('MM:SS')).not.toBeInTheDocument();
  });

  it('displays remaining time in MM:SS format', async () => {
    const futureEndsAt = new Date(Date.now() + 300_000).toISOString();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ endsAt: futureEndsAt, totalSeconds: 300 }) })));

    render(<CountdownTimer />);

    await waitFor(() => {
      const display = document.querySelector('[aria-live="polite"]');
      expect(display).toBeInTheDocument();
      expect(display?.textContent).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('calls DELETE when Stop is clicked and returns to idle', async () => {
    const futureEndsAt = new Date(Date.now() + 300_000).toISOString();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ endsAt: futureEndsAt, totalSeconds: 300 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ endsAt: null, totalSeconds: 0 }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /stop/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /stop/i }));
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/countdown', expect.objectContaining({ method: 'DELETE' }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument();
    });
  });

  // ── time's up state ───────────────────────────────────────────────────────

  it("shows \"Time's up!\" and Reset button when endsAt is in the past", async () => {
    const pastEndsAt = new Date(Date.now() - 1000).toISOString();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ endsAt: pastEndsAt, totalSeconds: 60 }) })));

    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(screen.getByRole('status')).toHaveTextContent(/time's up/i);
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls DELETE when Reset is clicked and returns to idle', async () => {
    const pastEndsAt = new Date(Date.now() - 1000).toISOString();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ endsAt: pastEndsAt, totalSeconds: 60 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ endsAt: null, totalSeconds: 0 }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<CountdownTimer />);
    await waitFor(() => screen.getByRole('button', { name: /reset/i }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/countdown', expect.objectContaining({ method: 'DELETE' }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument();
    });
  });

  // ── resilience ────────────────────────────────────────────────────────────

  it('stays in the idle state when the initial fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('Network failure'); }));

    render(<CountdownTimer />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(document.querySelector('section[aria-label="Shared countdown timer"]')).toBeInTheDocument();
    // Form is shown because initial state is idle (null) and the failed fetch didn't change it
    expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument();
  });
});
