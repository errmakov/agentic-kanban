import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { EmojiReactionBar } from './index';

const EMOJIS = ['👍', '🔥', '❤️', '😂', '🚀'];

function jsonResponse(body: unknown): Response {
  return { ok: true, json: async () => body } as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EmojiReactionBar', () => {
  it('renders all five emoji buttons', () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(Object.fromEntries(EMOJIS.map((e) => [e, 0]))),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<EmojiReactionBar />);

    for (const emoji of EMOJIS) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toBeInTheDocument();
    }
  });

  it('POSTs the tapped emoji and updates the displayed count', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(Object.fromEntries(EMOJIS.map((e) => [e, 0]))))
      .mockResolvedValueOnce(
        jsonResponse({ ...Object.fromEntries(EMOJIS.map((e) => [e, 0])), '👍': 1 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<EmojiReactionBar />);

    const button = screen.getByRole('button', { name: 'React with 👍' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/emoji-reactions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ emoji: '👍' }),
        }),
      );
    });

    await waitFor(() => {
      expect(button).toHaveTextContent('1');
    });
  });
});
