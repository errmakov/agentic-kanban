import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
});

function mockFetch(state: { startedAt: number | null; durationMs: number | null }) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    json: async () => state,
  });
}

describe('CountdownTimer', () => {
  it('idle state renders a +Countdown button', async () => {
    mockFetch({ startedAt: null, durationMs: null });
    render(<CountdownTimer />);
    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  it('entering valid MM:SS and clicking Start calls POST', async () => {
    mockFetch({ startedAt: null, durationMs: null });
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({ json: async () => ({ startedAt: null, durationMs: null }) });

    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));

    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '30' } });

    fetchMock.mockResolvedValue({ json: async () => ({ startedAt: Date.now(), durationMs: 90000 }) });
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }));

    await waitFor(() => {
      const calls = fetchMock.mock.calls;
      const postCall = calls.find(
        (c) => c[0] === '/api/countdown-timer' && (c[1] as RequestInit)?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse((postCall![1] as RequestInit).body as string);
      expect(body.durationMs).toBe(90000);
    });
  });

  it('displays the countdown when a running timer state is received', async () => {
    vi.useFakeTimers();
    const startedAt = Date.now() - 5000;
    const durationMs = 60000;
    mockFetch({ startedAt, durationMs });

    render(<CountdownTimer />);

    // Let the server poll resolve (async fetch mock)
    await act(async () => {
      await Promise.resolve();
    });

    // Advance 300ms to trigger the first interval tick
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('displays "Time\'s up" when remaining is zero', async () => {
    vi.useFakeTimers();
    const startedAt = Date.now() - 120000;
    const durationMs = 60000;
    mockFetch({ startedAt, durationMs });

    render(<CountdownTimer />);

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/time's up/i)).toBeInTheDocument();
  });
});
