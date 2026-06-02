import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Countdown } from './Countdown';

function mockFetch(state: { status: string; endsAt: number | null; durationMs: number }) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => state,
  });
}

describe('Countdown', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the +Countdown button in idle state', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'idle', endsAt: null, durationMs: 0 }));
    render(<Countdown />);
    expect(await screen.findByRole('button', { name: /\+countdown/i })).toBeInTheDocument();
  });

  it('shows the setup form after clicking +Countdown', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'idle', endsAt: null, durationMs: 0 }));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+countdown/i }));
    expect(screen.getByLabelText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seconds/i)).toBeInTheDocument();
  });

  it('disables Start when both inputs are 0', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'idle', endsAt: null, durationMs: 0 }));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+countdown/i }));
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('enables Start once a non-zero duration is entered', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'idle', endsAt: null, durationMs: 0 }));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+countdown/i }));
    fireEvent.change(screen.getByLabelText(/seconds/i), { target: { value: '30' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeEnabled();
  });

  it('enables Start when only minutes is non-zero', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'idle', endsAt: null, durationMs: 0 }));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+countdown/i }));
    fireEvent.change(screen.getByLabelText(/minutes/i), { target: { value: '1' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeEnabled();
  });

  it('Cancel returns to idle state', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'idle', endsAt: null, durationMs: 0 }));
    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+countdown/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(await screen.findByRole('button', { name: /\+countdown/i })).toBeInTheDocument();
  });

  it('shows a running timer when the server reports running', async () => {
    const endsAt = Date.now() + 90_000;
    vi.stubGlobal('fetch', mockFetch({ status: 'running', endsAt, durationMs: 90_000 }));
    render(<Countdown />);
    await waitFor(() => expect(screen.getByRole('timer')).toBeInTheDocument());
    expect(screen.getByRole('timer').textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it('shows a Reset button in running state', async () => {
    const endsAt = Date.now() + 90_000;
    vi.stubGlobal('fetch', mockFetch({ status: 'running', endsAt, durationMs: 90_000 }));
    render(<Countdown />);
    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it("shows Time's up when the server reports done", async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'done', endsAt: 1, durationMs: 1000 }));
    render(<Countdown />);
    await waitFor(() => expect(screen.getByText(/time's up/i)).toBeInTheDocument());
  });

  it('shows a Reset button in done state', async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'done', endsAt: 1, durationMs: 1000 }));
    render(<Countdown />);
    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('Start POSTs action:start with the correct minutes and seconds', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'idle', endsAt: null, durationMs: 0 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'running', endsAt: Date.now() + 90_000, durationMs: 90_000 }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<Countdown />);
    fireEvent.click(await screen.findByRole('button', { name: /\+countdown/i }));
    fireEvent.change(screen.getByLabelText(/minutes/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/seconds/i), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/countdown',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'start', minutes: 1, seconds: 30 }),
        }),
      ),
    );
  });

  it('Reset in done state POSTs action:reset and returns to idle', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'done', endsAt: 1, durationMs: 1000 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: 'idle', endsAt: null, durationMs: 0 }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<Countdown />);
    await waitFor(() => expect(screen.getByText(/time's up/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/countdown',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'reset' }),
        }),
      ),
    );
    expect(await screen.findByRole('button', { name: /\+countdown/i })).toBeInTheDocument();
  });
});
