import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
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

  it('clicking +Countdown reveals the MM:SS input form', async () => {
    mockFetch({ startedAt: null, durationMs: null });
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^start$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
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

  it('shows a validation error when duration is 00:00', async () => {
    mockFetch({ startedAt: null, durationMs: null });
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    // Leave both inputs empty — defaults to 0:0
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }));
    expect(await screen.findByText(/at least 1 second/i)).toBeInTheDocument();
  });

  it('shows a validation error when minutes exceed 99', async () => {
    mockFetch({ startedAt: null, durationMs: null });
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }));
    expect(await screen.findByText(/valid time/i)).toBeInTheDocument();
  });

  it('shows a validation error when seconds exceed 59', async () => {
    mockFetch({ startedAt: null, durationMs: null });
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }));
    expect(await screen.findByText(/valid time/i)).toBeInTheDocument();
  });

  it('accepts 99:59 as the maximum valid duration', async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({ json: async () => ({ startedAt: null, durationMs: null }) });
    fetchMock.mockResolvedValue({
      json: async () => ({ startedAt: Date.now(), durationMs: (99 * 60 + 59) * 1000 }),
    });

    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '99' } });
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '59' } });
    fireEvent.click(screen.getByRole('button', { name: /^start$/i }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(
        (c) => c[0] === '/api/countdown-timer' && (c[1] as RequestInit)?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse((postCall![1] as RequestInit).body as string);
      expect(body.durationMs).toBe((99 * 60 + 59) * 1000);
    });
  });

  it('Cancel button closes the form and restores the +Countdown button', async () => {
    mockFetch({ startedAt: null, durationMs: null });
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('Minutes')).not.toBeInTheDocument();
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

  it('Reset button calls DELETE', async () => {
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
    const startedAt = Date.now() - 5000;
    const durationMs = 60000;
    fetchMock.mockResolvedValue({ json: async () => ({ startedAt, durationMs }) });

    render(<CountdownTimer />);

    // Wait for initial poll to resolve and show the Reset button
    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();

    fetchMock.mockResolvedValue({ json: async () => ({ startedAt: null, durationMs: null }) });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      const deleteCall = fetchMock.mock.calls.find(
        (c) => c[0] === '/api/countdown-timer' && (c[1] as RequestInit)?.method === 'DELETE',
      );
      expect(deleteCall).toBeDefined();
    });
  });
});
