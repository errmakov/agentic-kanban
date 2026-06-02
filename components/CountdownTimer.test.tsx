import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

function mockFetch(state: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => state,
    })) as unknown as typeof fetch,
  );
}

function mockFetchByMethod(getState: unknown, postState: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, options?: RequestInit) => ({
      ok: true,
      json: async () => (options?.method === 'POST' ? postState : getState),
    })) as unknown as typeof fetch,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CountdownTimer', () => {
  it('renders the + Countdown trigger when idle', async () => {
    mockFetch({ status: 'idle', endsAt: null });
    render(<CountdownTimer />);
    expect(await screen.findByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  it('renders the "Time\'s up!" state when finished', async () => {
    mockFetch({ status: 'finished', endsAt: Date.now() - 1000 });
    render(<CountdownTimer />);
    expect(await screen.findByText(/time's up!/i)).toBeInTheDocument();
  });

  it('renders a formatted MM:SS time when running', async () => {
    mockFetch({ status: 'running', endsAt: Date.now() + 65_000 });
    render(<CountdownTimer />);
    expect(await screen.findByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it('+ Countdown button starts with aria-expanded false', async () => {
    mockFetch({ status: 'idle', endsAt: null });
    render(<CountdownTimer />);
    const btn = await screen.findByRole('button', { name: /\+ countdown/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking + Countdown toggles aria-expanded to true', async () => {
    mockFetch({ status: 'idle', endsAt: null });
    render(<CountdownTimer />);
    const btn = await screen.findByRole('button', { name: /\+ countdown/i });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows a validation error when 00:00 is submitted', async () => {
    mockFetch({ status: 'idle', endsAt: null });
    render(<CountdownTimer />);
    await screen.findByRole('button', { name: /\+ countdown/i });
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/00:00/);
  });

  it('shows a validation error for out-of-range minutes', async () => {
    mockFetch({ status: 'idle', endsAt: null });
    render(<CountdownTimer />);
    await screen.findByRole('button', { name: /\+ countdown/i });
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/minutes/i);
  });

  it('shows a Reset button in the running state', async () => {
    mockFetch({ status: 'running', endsAt: Date.now() + 65_000 });
    render(<CountdownTimer />);
    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('shows a Reset button in the finished state', async () => {
    mockFetch({ status: 'finished', endsAt: null });
    render(<CountdownTimer />);
    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('clicking Reset POSTs with action: reset', async () => {
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => ({
      ok: true,
      json: async () =>
        options?.method === 'POST'
          ? { status: 'idle', endsAt: null }
          : { status: 'running', endsAt: Date.now() + 60_000 },
    }));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
    render(<CountdownTimer />);
    const resetBtn = await screen.findByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);
    await waitFor(() => {
      const postCalls = (fetchMock.mock.calls as Array<[string, RequestInit | undefined]>).filter(
        ([, opts]) => opts?.method === 'POST',
      );
      expect(postCalls).toHaveLength(1);
      expect(JSON.parse(postCalls[0][1]!.body as string)).toEqual({ action: 'reset' });
    });
  });

  it('clicking Start POSTs with the correct durationSeconds', async () => {
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => ({
      ok: true,
      json: async () =>
        options?.method === 'POST'
          ? { status: 'running', endsAt: Date.now() + 300_000 }
          : { status: 'idle', endsAt: null },
    }));
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
    render(<CountdownTimer />);
    await screen.findByRole('button', { name: /\+ countdown/i });
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    await waitFor(() => {
      const postCalls = (fetchMock.mock.calls as Array<[string, RequestInit | undefined]>).filter(
        ([, opts]) => opts?.method === 'POST',
      );
      expect(postCalls).toHaveLength(1);
      expect(JSON.parse(postCalls[0][1]!.body as string)).toEqual({
        action: 'start',
        durationSeconds: 300,
      });
    });
  });

  it('shows an error message when the Start API call fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) => ({
        ok: options?.method !== 'POST',
        json: async () =>
          options?.method === 'POST'
            ? { error: 'server error' }
            : { status: 'idle', endsAt: null },
      })) as unknown as typeof fetch,
    );
    render(<CountdownTimer />);
    await screen.findByRole('button', { name: /\+ countdown/i });
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not start/i);
  });
});
