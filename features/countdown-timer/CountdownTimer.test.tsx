import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer, formatMMSS } from './index';

type State = { status: string; durationSeconds: number; startedAt: number };

function stubFetch(getState: State, postState?: State) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, opts?: RequestInit) => ({
      ok: true,
      json: async () => (opts?.method === 'POST' && postState ? postState : getState),
    })),
  );
}

beforeEach(() => {
  stubFetch({ status: 'idle', durationSeconds: 0, startedAt: 0 });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// formatMMSS
// ---------------------------------------------------------------------------

describe('formatMMSS', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatMMSS(0)).toBe('00:00');
  });

  it('formats 59 seconds as 00:59', () => {
    expect(formatMMSS(59)).toBe('00:59');
  });

  it('formats 60 seconds as 01:00', () => {
    expect(formatMMSS(60)).toBe('01:00');
  });

  it('formats 3599 seconds as 59:59', () => {
    expect(formatMMSS(3599)).toBe('59:59');
  });

  it('formats 5999 seconds (max) as 99:59', () => {
    expect(formatMMSS(5999)).toBe('99:59');
  });

  it('clamps negative values to 00:00', () => {
    expect(formatMMSS(-1)).toBe('00:00');
    expect(formatMMSS(-999)).toBe('00:00');
  });
});

// ---------------------------------------------------------------------------
// Idle state
// ---------------------------------------------------------------------------

describe('CountdownTimer — idle state', () => {
  it('renders the + Countdown button', async () => {
    render(<CountdownTimer />);
    expect(
      await screen.findByRole('button', { name: /\+ countdown/i }),
    ).toBeInTheDocument();
  });

  it('shows form with Minutes/Seconds inputs and Start button after clicking + Countdown', async () => {
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    await waitFor(() => expect(screen.getByLabelText('Minutes')).toBeInTheDocument());
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('hides the form and shows + Countdown again when Cancel is clicked', async () => {
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    await waitFor(() => expect(screen.getByLabelText('Minutes')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByLabelText('Minutes')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /\+ countdown/i })).toBeInTheDocument();
  });

  it('disables Start when both minutes and seconds are 0', async () => {
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    await waitFor(() => expect(screen.getByLabelText('Minutes')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Seconds'), { target: { value: '0' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('enables Start when time is at least 1 second (default 05:00)', async () => {
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    await waitFor(() => expect(screen.getByLabelText('Minutes')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /start/i })).not.toBeDisabled();
  });

  it('transitions to running state when Start is clicked', async () => {
    stubFetch(
      { status: 'idle', durationSeconds: 0, startedAt: 0 },
      { status: 'running', durationSeconds: 300, startedAt: Date.now() },
    );
    render(<CountdownTimer />);
    fireEvent.click(await screen.findByRole('button', { name: /\+ countdown/i }));
    await waitFor(() => expect(screen.getByLabelText('Minutes')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText('Minutes')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Running state
// ---------------------------------------------------------------------------

describe('CountdownTimer — running state', () => {
  beforeEach(() => {
    stubFetch({ status: 'running', durationSeconds: 300, startedAt: Date.now() - 10_000 });
  });

  it('shows a MM:SS time display', async () => {
    render(<CountdownTimer />);
    await waitFor(() => expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument());
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('shows Reset button', async () => {
    render(<CountdownTimer />);
    expect(await screen.findByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('does not show + Countdown button while running', async () => {
    render(<CountdownTimer />);
    await waitFor(() => expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /\+ countdown/i })).not.toBeInTheDocument();
  });

  it('transitions to idle when Reset is clicked', async () => {
    stubFetch(
      { status: 'running', durationSeconds: 300, startedAt: Date.now() - 10_000 },
      { status: 'idle', durationSeconds: 0, startedAt: 0 },
    );
    render(<CountdownTimer />);
    await waitFor(() => expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /\+ countdown/i })).toBeInTheDocument(),
    );
  });
});

// ---------------------------------------------------------------------------
// Done state
// ---------------------------------------------------------------------------

describe('CountdownTimer — done state', () => {
  beforeEach(() => {
    stubFetch({ status: 'done', durationSeconds: 60, startedAt: 0 });
  });

  it('shows "Time\'s up!" heading', async () => {
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /time's up!/i })).toBeInTheDocument(),
    );
  });

  it('shows New Countdown button', async () => {
    render(<CountdownTimer />);
    expect(await screen.findByRole('button', { name: /new countdown/i })).toBeInTheDocument();
  });

  it('does not show + Countdown button when done', async () => {
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /time's up!/i })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: /\+ countdown/i })).not.toBeInTheDocument();
  });

  it('transitions to the input form when New Countdown is clicked', async () => {
    stubFetch(
      { status: 'done', durationSeconds: 60, startedAt: 0 },
      { status: 'idle', durationSeconds: 0, startedAt: 0 },
    );
    render(<CountdownTimer />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /new countdown/i })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /new countdown/i }));
    await waitFor(() => expect(screen.getByLabelText('Minutes')).toBeInTheDocument());
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
  });
});
