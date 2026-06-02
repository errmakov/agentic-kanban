import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Wall } from './Wall';

describe('Wall', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the welcome heading', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<Wall />);
    expect(
      screen.getByRole('heading', { name: /welcome to the workshop/i }),
    ).toBeInTheDocument();
  });

  it('renders the agenda list inside the wall', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<Wall />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders the emoji reaction bar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ '👍': 0, '❤️': 0, '🎉': 0, '🤔': 0 }),
    }));

    render(<Wall />);

    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'Reactions' })).toBeInTheDocument();
    });
  });
});
