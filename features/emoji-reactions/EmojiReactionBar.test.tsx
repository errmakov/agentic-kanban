import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const EmojiReactionBar = feature.Component;

describe('EmojiReactionBar', () => {
  const json = (body: Record<string, number>) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation((_url, init) =>
      Promise.resolve(
        init?.method === 'POST'
          ? json({ '👍': 4, '❤️': 1, '😂': 0, '🎉': 0, '🔥': 0 })
          : json({ '👍': 3, '❤️': 1, '😂': 0, '🎉': 0, '🔥': 0 }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button per emoji', async () => {
    render(<EmojiReactionBar />);
    expect(screen.getByRole('button', { name: /react with 👍/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('shows counts fetched from the API', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('posts the tapped emoji and increments optimistically', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /react with 👍/i }));

    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/emoji-reactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ emoji: '👍' }),
      }),
    );
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
  });
});
