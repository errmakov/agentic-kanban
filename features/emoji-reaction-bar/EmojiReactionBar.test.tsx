import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import feature from './index';

const { Component: EmojiReactionBar } = feature;

function mockFetch(getCounts: Record<string, number>) {
  return vi.fn((url: string, opts?: RequestInit) => {
    if (opts?.method === 'POST') {
      const { emoji } = JSON.parse(opts.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...getCounts, [emoji]: (getCounts[emoji] ?? 0) + 1 }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(getCounts) });
  });
}

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button for each emoji with its count after the initial fetch', async () => {
    vi.stubGlobal('fetch', mockFetch({ '👍': 3, '❤️': 1, '🔥': 0, '👏': 0, '😂': 0 }));
    render(<EmojiReactionBar />);

    expect(await screen.findByRole('button', { name: /react with 👍/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('optimistically increments the count on click', async () => {
    vi.stubGlobal('fetch', mockFetch({ '👍': 3, '❤️': 1, '🔥': 0, '👏': 0, '😂': 0 }));
    render(<EmojiReactionBar />);

    const button = await screen.findByRole('button', { name: /react with 👍/i });
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
  });
});
