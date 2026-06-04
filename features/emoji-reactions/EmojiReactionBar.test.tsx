import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmojiReactionBar } from './index';

const ALLOWED_EMOJIS = ['👏', '🔥', '🤔', '💡'];
const INITIAL_COUNTS = { '👏': 1, '🔥': 2, '🤔': 3, '💡': 4 };

function makeFetch(getResponse = INITIAL_COUNTS, postResponse = INITIAL_COUNTS) {
  return vi.fn().mockImplementation((_url: string, options?: RequestInit) =>
    Promise.resolve({
      json: async () => (options?.method === 'POST' ? postResponse : getResponse),
    }),
  );
}

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    global.fetch = makeFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button for each emoji', async () => {
    render(<EmojiReactionBar />);
    // Drain initial fetch so no state update leaks after test
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/emoji-reactions'));
    for (const emoji of ALLOWED_EMOJIS) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toBeInTheDocument();
    }
  });

  it('shows zero counts before the initial fetch resolves', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    render(<EmojiReactionBar />);
    for (const emoji of ALLOWED_EMOJIS) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toHaveTextContent('0');
    }
  });

  it('displays counts from the initial GET response', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'React with 👏' })).toHaveTextContent('1');
      expect(screen.getByRole('button', { name: 'React with 🔥' })).toHaveTextContent('2');
    });
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
    // Drain POST response so no state update leaks after test
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });

  it('optimistically increments count before POST resolves', async () => {
    global.fetch = vi.fn().mockImplementation((_url: string, options?: RequestInit) => {
      if (options?.method === 'POST') return new Promise(() => {}); // never resolves in this test
      return Promise.resolve({ json: async () => ({ '👏': 5, '🔥': 0, '🤔': 0, '💡': 0 }) });
    });

    render(<EmojiReactionBar />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'React with 👏' })).toHaveTextContent('5'),
    );

    fireEvent.click(screen.getByRole('button', { name: 'React with 👏' }));

    // Optimistic update visible immediately — POST hasn't resolved yet
    expect(screen.getByRole('button', { name: 'React with 👏' })).toHaveTextContent('6');
  });

  it('syncs count from the POST response', async () => {
    // POST response returns a higher count (another client reacted concurrently)
    global.fetch = makeFetch(
      { '👏': 5, '🔥': 0, '🤔': 0, '💡': 0 },
      { '👏': 7, '🔥': 0, '🤔': 0, '💡': 0 },
    );

    render(<EmojiReactionBar />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'React with 👏' })).toHaveTextContent('5'),
    );

    fireEvent.click(screen.getByRole('button', { name: 'React with 👏' }));

    // After POST resolves, count syncs to server value (7)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'React with 👏' })).toHaveTextContent('7'),
    );
  });

  it('renders without crashing when the initial fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    render(<EmojiReactionBar />);
    // Component should still render with zeroed counts
    for (const emoji of ALLOWED_EMOJIS) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toBeInTheDocument();
    }
  });
});
