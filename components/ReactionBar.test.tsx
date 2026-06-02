import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReactionBar } from './ReactionBar';
import { EMOJIS } from '@/lib/emojis';

function mockFetch(initial: Record<string, number>) {
  return vi.fn((url: string, init?: RequestInit) => {
    if (init?.method === 'POST') {
      const { emoji } = JSON.parse(init.body as string) as { emoji: string };
      const counts = { ...initial, [emoji]: (initial[emoji] ?? 0) + 1 };
      return Promise.resolve({ json: () => Promise.resolve({ counts }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({ counts: initial }) });
  });
}

describe('ReactionBar', () => {
  beforeEach(() => {
    const initial = { '👍': 3, '❤️': 1, '🔥': 0, '👏': 0, '🤯': 0 };
    global.fetch = mockFetch(initial) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button for every emoji', () => {
    render(<ReactionBar />);
    for (const emoji of EMOJIS) {
      expect(
        screen.getByRole('button', { name: `${emoji} reaction` }),
      ).toBeInTheDocument();
    }
  });

  it('displays the initial counts fetched on mount', async () => {
    render(<ReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('increments a count when its button is tapped', async () => {
    render(<ReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '👍 reaction' }));

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/reactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ emoji: '👍' }),
      }),
    );
  });
});
