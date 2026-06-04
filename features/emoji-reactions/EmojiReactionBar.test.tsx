import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmojiReactionBar } from './index';

const ALLOWED_EMOJIS = ['👏', '🔥', '🤔', '💡'];

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ '👏': 1, '🔥': 2, '🤔': 3, '💡': 4 }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button for each emoji', async () => {
    render(<EmojiReactionBar />);
    for (const emoji of ALLOWED_EMOJIS) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toBeInTheDocument();
    }
  });

  it('posts to the API when a button is clicked', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/emoji-reactions'));

    fireEvent.click(screen.getByRole('button', { name: 'React with 👏' }));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/emoji-reactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ emoji: '👏' }),
      }),
    );
  });
});
