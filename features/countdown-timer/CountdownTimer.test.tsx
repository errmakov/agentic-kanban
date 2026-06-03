import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountdownTimer, formatMMSS } from './index';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: 'idle', durationSeconds: 0, startedAt: 0 }),
    })),
  );
});

describe('formatMMSS', () => {
  it('formats seconds as MM:SS', () => {
    expect(formatMMSS(0)).toBe('00:00');
    expect(formatMMSS(59)).toBe('00:59');
    expect(formatMMSS(60)).toBe('01:00');
    expect(formatMMSS(3599)).toBe('59:59');
  });
});

describe('CountdownTimer', () => {
  it('renders the + Countdown button in idle state', async () => {
    render(<CountdownTimer />);
    expect(
      await screen.findByRole('button', { name: /\+ countdown/i }),
    ).toBeInTheDocument();
  });

  it('shows the minutes/seconds inputs and Start button after clicking + Countdown', async () => {
    render(<CountdownTimer />);
    fireEvent.click(screen.getByRole('button', { name: /\+ countdown/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Seconds')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });
});
