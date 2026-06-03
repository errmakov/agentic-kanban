import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from './CountdownTimer';

function mockFetch(endsAt: string | null) {
  const status = !endsAt
    ? 'idle'
    : new Date(endsAt).getTime() - Date.now() > 0
    ? 'running'
    : 'done';
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ endsAt, status }),
      }),
    ),
  );
}

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CountdownTimer', () => {
  it('shows idle state with inputs and start button', async () => {
    mockFetch(null);
    render(<CountdownTimer />);
    expect(await screen.findByText('Start Countdown')).toBeInTheDocument();
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
    expect(screen.queryByText(/time'?s up/i)).not.toBeInTheDocument();
  });

  it('shows running state with timer display and reset button', async () => {
    const future = new Date(Date.now() + 120_000).toISOString();
    mockFetch(future);
    render(<CountdownTimer />);
    expect(await screen.findByRole('timer')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.queryByText(/time'?s up/i)).not.toBeInTheDocument();
  });

  it('shows done state with "Time\'s up!" message', async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    mockFetch(past);
    render(<CountdownTimer />);
    expect(await screen.findByText(/time'?s up/i)).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('Start button is disabled when MM and SS are both 0', async () => {
    mockFetch(null);
    render(<CountdownTimer />);
    await screen.findByText('Start Countdown');

    const startBtn = screen.getByText('Start Countdown');
    // Default mm=5, ss=0 — button should be enabled
    expect(startBtn).not.toBeDisabled();

    // Set MM to 0 — now 0:00 — button should be disabled
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '0' } });
    expect(startBtn).toBeDisabled();
  });

  it('timer display shows time in MM:SS format', async () => {
    const future = new Date(Date.now() + 120_000).toISOString();
    mockFetch(future);
    render(<CountdownTimer />);
    const timer = await screen.findByRole('timer');
    expect(timer.textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it('clicking Start Countdown POSTs with correct payload', async () => {
    const future = new Date(Date.now() + 300_000).toISOString();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: null, status: 'idle' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: future, status: 'running' }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<CountdownTimer />);
    await screen.findByText('Start Countdown');

    await act(async () => {
      fireEvent.click(screen.getByText('Start Countdown'));
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/countdown', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ action: 'start', seconds: 300 }), // default 5*60 + 0
    }));
  });

  it('clicking Reset from running state POSTs with reset action', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: future, status: 'running' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: null, status: 'idle' }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<CountdownTimer />);
    await screen.findByRole('timer');

    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/countdown', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ action: 'reset' }),
    }));
  });

  it('Reset returns to idle state showing the input form', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: future, status: 'running' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: null, status: 'idle' }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<CountdownTimer />);
    await screen.findByRole('timer');

    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
    });

    expect(await screen.findByText('Start Countdown')).toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('clicking Reset from done state POSTs with reset action', async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: past, status: 'done' }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ endsAt: null, status: 'idle' }) });
    vi.stubGlobal('fetch', fetchMock);

    render(<CountdownTimer />);
    await screen.findByText(/time'?s up/i);

    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/countdown', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ action: 'reset' }),
    }));
  });
});
