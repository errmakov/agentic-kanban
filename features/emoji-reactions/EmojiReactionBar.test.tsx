import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import feature from './index';

const EmojiReactionBar = feature.Component;

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders all six emoji buttons', () => {
    render(<EmojiReactionBar />);
    for (const emoji of ['👍', '❤️', '😂', '🔥', '🎉', '🤯']) {
      expect(
        screen.getByRole('button', { name: `React with ${emoji}` }),
      ).toBeInTheDocument();
    }
  });

  it('shows count 0 before the fetch resolves', () => {
    render(<EmojiReactionBar />);
    expect(screen.getAllByText('0')).toHaveLength(6);
  });

  it('shows the fetched counts once the GET resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ '👍': 7 }) })),
    );
    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument());
  });
});
