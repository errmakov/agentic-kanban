import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReactionBar } from './ReactionBar';

const EMOJIS = ['👍', '❤️', '🔥', '👏', '🚀'];

describe('ReactionBar', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        counts: { '👍': 0, '❤️': 0, '🔥': 0, '👏': 0, '🚀': 0 },
      }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button for every emoji', async () => {
    render(<ReactionBar />);
    for (const emoji of EMOJIS) {
      expect(
        screen.getByRole('button', { name: new RegExp(`React with ${emoji}`) }),
      ).toBeInTheDocument();
    }
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('shows the counts fetched on mount', async () => {
    render(<ReactionBar />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reactions');
    });
    expect(screen.getAllByText('0').length).toBe(EMOJIS.length);
  });
});
