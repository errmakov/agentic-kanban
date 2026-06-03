import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import feature from './index';

const EMOJIS = ['👍', '❤️', '🎉', '🚀'];

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ '👍': 0, '❤️': 0, '🎉': 0, '🚀': 0 }),
    });
  });

  it('renders the four emoji buttons', async () => {
    const { Component } = feature;
    render(<Component />);
    for (const emoji of EMOJIS) {
      expect(
        await screen.findByRole('button', { name: `React with ${emoji}` }),
      ).toBeInTheDocument();
    }
  });

  it('posts the emoji when a button is clicked', async () => {
    const { Component } = feature;
    render(<Component />);
    const button = await screen.findByRole('button', { name: 'React with 👍' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji: '👍' }),
      });
    });
  });
});
