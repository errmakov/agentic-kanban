import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmojiReactionBar } from './index';

const initialCounts = { '👍': 3, '❤️': 1, '🔥': 0, '🎉': 5 };

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    const fetchMock = vi.fn(async () => ({
      json: async () => ({ counts: initialCounts }),
    }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders a button for every emoji', async () => {
    render(<EmojiReactionBar />);
    for (const emoji of ['👍', '❤️', '🔥', '🎉']) {
      expect(
        screen.getByRole('button', { name: `React with ${emoji}` }),
      ).toBeInTheDocument();
    }
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('shows the counts fetched from the API', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('POSTs the tapped emoji to the API', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'React with 🔥' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/emoji-reactions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ emoji: '🔥' }),
        }),
      );
    });
  });
});
