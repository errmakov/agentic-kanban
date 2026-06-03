import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const EmojiReactionBar = feature.Component;

describe('EmojiReactionBar', () => {
  const json = (body: Record<string, number>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  const initialCounts = { '👍': 3, '❤️': 1, '😂': 0, '🎉': 0, '🔥': 0 };
  const afterThumbsUp = { '👍': 4, '❤️': 1, '😂': 0, '🎉': 0, '🔥': 0 };

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation((_url, init) =>
      Promise.resolve(
        init?.method === 'POST' ? json(afterThumbsUp) : json(initialCounts),
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

  it('renders a button for each of the five emojis', async () => {
    render(<EmojiReactionBar />);
    for (const emoji of ['👍', '❤️', '😂', '🎉', '🔥']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`react with ${emoji}`, 'i') }),
      ).toBeInTheDocument();
    }
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

  it('reverts the optimistic increment when POST fails', async () => {
    vi.mocked(global.fetch).mockImplementation((_url, init) =>
      Promise.resolve(
        init?.method === 'POST'
          ? new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
          : json(initialCounts),
      ),
    );

    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /react with 👍/i }));
    // Optimistic increment is immediate
    expect(screen.getByText('4')).toBeInTheDocument();

    // After POST failure, count reverts
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('silently recovers when GET fetch fails', async () => {
    vi.mocked(global.fetch).mockImplementation(() =>
      Promise.reject(new Error('Network error')),
    );

    render(<EmojiReactionBar />);

    // Component renders without crashing; all counts stay at zero
    expect(screen.getAllByRole('button')).toHaveLength(5);
    await waitFor(() => {
      expect(screen.getAllByText('0')).toHaveLength(5);
    });
  });
});

describe('feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('emoji-reactions');
  });

  it('renders into the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 50', () => {
    expect(feature.order).toBe(50);
  });
});
