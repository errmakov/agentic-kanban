import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from './index';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ endsAt: null, totalSeconds: 0 }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the MM:SS input and Start button in the idle state', async () => {
    render(<CountdownTimer />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('MM:SS')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });
});
