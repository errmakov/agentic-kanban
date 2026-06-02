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

  it("shows Time's up when the server reports done", async () => {
    vi.stubGlobal('fetch', mockFetch({ status: 'done', endsAt: 1, durationMs: 1000 }));
    render(<Countdown />);
    await waitFor(() => expect(screen.getByText(/time's up/i)).toBeInTheDocument());
  });
});
