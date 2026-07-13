import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import feature from './index';

const CountdownTimer = feature.Component;

type State = { startedAt: number | null; durationSeconds: number };

function stubFetch(handler: (url: string, opts?: RequestInit) => unknown) {
  const mock = vi.fn(handler);
  vi.stubGlobal('fetch', mock);
  return mock;
}

function stubFetchStatic(state: State) {
  return stubFetch(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(state) }),
  );
}

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // --- display states ---

  it('renders the MM:SS start form when idle', async () => {
    stubFetchStatic({ startedAt: null, durationSeconds: 0 });
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: /countdown/i })).toBeInTheDocument();
  });

  it('shows a ticking MM:SS display when a timer is running', async () => {
    stubFetchStatic({ startedAt: Date.now(), durationSeconds: 120 });
    render(<CountdownTimer />);
    const display = await screen.findByLabelText('Time remaining');
    expect(display.textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it("shows \"Time's up!\" when the timer has elapsed", async () => {
    stubFetchStatic({ startedAt: Date.now() - 61000, durationSeconds: 60 });
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByText(/time's up/i)).toBeInTheDocument(),
    );
  });

  // --- Start button disabled / enabled ---

  it('disables the Start button when the input is empty', async () => {
    stubFetchStatic({ startedAt: null, durationSeconds: 0 });
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /countdown/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: /countdown/i })).toBeDisabled();
  });

  it('disables the Start button for "00:00" (zero duration)', async () => {
    stubFetchStatic({ startedAt: null, durationSeconds: 0 });
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), {
      target: { value: '00:00' },
    });
    expect(screen.getByRole('button', { name: /countdown/i })).toBeDisabled();
  });

  it('disables the Start button for overflow input "100:00"', async () => {
    stubFetchStatic({ startedAt: null, durationSeconds: 0 });
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), {
      target: { value: '100:00' },
    });
    expect(screen.getByRole('button', { name: /countdown/i })).toBeDisabled();
  });

  it('enables the Start button for valid input "02:30"', async () => {
    stubFetchStatic({ startedAt: null, durationSeconds: 0 });
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), {
      target: { value: '02:30' },
    });
    expect(screen.getByRole('button', { name: /countdown/i })).not.toBeDisabled();
  });

  // --- form submission / reset interactions ---

  it('calls POST /api/countdown with durationSeconds=150 when "02:30" is submitted', async () => {
    const startedAt = Date.now();
    const fetchMock = stubFetch((url, opts) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ startedAt, durationSeconds: 150 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ startedAt: null, durationSeconds: 0 }),
      });
    });

    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByPlaceholderText('MM:SS'), {
      target: { value: '02:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: /countdown/i }));

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find((args) => args[1]?.method === 'POST');
      expect(postCall).toBeTruthy();
      expect(JSON.parse(postCall![1]!.body as string)).toEqual({
        durationSeconds: 150,
      });
    });
  });

  it('calls DELETE /api/countdown when Reset is clicked while running', async () => {
    const fetchMock = stubFetch((url, opts) => {
      if (opts?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ startedAt: null, durationSeconds: 0 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ startedAt: Date.now(), durationSeconds: 120 }),
      });
    });

    render(<CountdownTimer />);
    await screen.findByLabelText('Time remaining');
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      const deleteCall = fetchMock.mock.calls.find((args) => args[1]?.method === 'DELETE');
      expect(deleteCall).toBeTruthy();
    });
  });

  it('calls DELETE /api/countdown when Reset is clicked in done state', async () => {
    const fetchMock = stubFetch((url, opts) => {
      if (opts?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ startedAt: null, durationSeconds: 0 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ startedAt: Date.now() - 61000, durationSeconds: 60 }),
      });
    });

    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByText(/time's up/i)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      const deleteCall = fetchMock.mock.calls.find((args) => args[1]?.method === 'DELETE');
      expect(deleteCall).toBeTruthy();
    });
  });

  it('stays in idle state when fetch fails (error swallowed silently)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network error'))));
    render(<CountdownTimer />);
    // Initial state is IDLE; failed poll must not crash the component
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /countdown/i })).toBeInTheDocument(),
    );
  });
});
