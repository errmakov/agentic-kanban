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

  it('shows zero counts for all emojis before the initial fetch resolves', () => {
    // fetch never resolves in this test — verifies the zeroCounts() initial state
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
    render(<EmojiReactionBar />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    const countSpans = buttons.map((btn) => btn.querySelector('span:not([aria-hidden])'));
    countSpans.forEach((span) => expect(span?.textContent).toBe('0'));
  });

  it('rolls back the optimistic count when the POST request fails', async () => {
    // GET succeeds; POST returns ok: false
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') {
          return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ '👍': 2, '❤️': 0, '🔥': 0, '👏': 0, '😂': 0 }),
        });
      }),
    );
    render(<EmojiReactionBar />);

    const button = await screen.findByRole('button', { name: /react with 👍/i });
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());

    fireEvent.click(button);
    // optimistic update fires immediately
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    // POST fails → reverts to original count
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });

  it('has the correct feature descriptor', () => {
    expect(feature.id).toBe('emoji-reaction-bar');
    expect(feature.slot).toBe('main');
    expect(feature.order).toBe(10);
    expect(typeof feature.Component).toBe('function');
  });
});
