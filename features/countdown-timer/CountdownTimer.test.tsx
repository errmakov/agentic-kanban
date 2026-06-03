import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CountdownTimer } from './index';

function mockFetch(state: object) {
  return vi.fn().mockResolvedValue({
    json: async () => state,
  });
}

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders minute/second inputs and a Start button in idle state', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'idle', endsAt: null, totalSeconds: 0 }),
    );
    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByLabelText(/minutes/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/seconds/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('disables Start when total seconds is 0', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'idle', endsAt: null, totalSeconds: 0 }),
    );
    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
    });
  });

  it('enables Start when the minutes input is given a non-zero value', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'idle', endsAt: null, totalSeconds: 0 }),
    );
    render(<CountdownTimer />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled(),
    );

    fireEvent.change(screen.getByLabelText(/minutes/i), { target: { value: '5' } });
    expect(screen.getByRole('button', { name: /start/i })).not.toBeDisabled();
  });

  it('enables Start when the seconds input is given a non-zero value', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'idle', endsAt: null, totalSeconds: 0 }),
    );
    render(<CountdownTimer />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled(),
    );

    fireEvent.change(screen.getByLabelText(/seconds/i), { target: { value: '30' } });
    expect(screen.getByRole('button', { name: /start/i })).not.toBeDisabled();
  });

  it('shows a MM:SS display and Reset button in running state', async () => {
    const endsAt = new Date(Date.now() + 90000).toISOString();
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'running', endsAt, totalSeconds: 90 }),
    );
    render(<CountdownTimer />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument(),
    );
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('hides the input form in running state', async () => {
    const endsAt = new Date(Date.now() + 60000).toISOString();
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'running', endsAt, totalSeconds: 60 }),
    );
    render(<CountdownTimer />);

    await waitFor(() =>
      expect(screen.queryByLabelText(/minutes/i)).not.toBeInTheDocument(),
    );
  });

  it('shows "Time\'s up!" when the API reports finished', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'finished', endsAt: null, totalSeconds: 60 }),
    );
    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByText(/time's up!/i)).toBeInTheDocument();
    });
  });

  it('shows a Reset button alongside the finished message', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ status: 'finished', endsAt: null, totalSeconds: 60 }),
    );
    render(<CountdownTimer />);

    await waitFor(() => {
      expect(screen.getByText(/time's up!/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });
  });
});
