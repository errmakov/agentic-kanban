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

  it('shows zero counts for all emojis before the initial fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(<EmojiReactionBar />);

    for (const emoji of EMOJIS) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toHaveTextContent('0');
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

  it('leaves counts at zero when the initial GET fetch fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'));
    vi.stubGlobal('fetch', fetchMock);

    render(<EmojiReactionBar />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    for (const emoji of EMOJIS) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toHaveTextContent('0');
    }
  });

  it('leaves counts unchanged when POST returns a non-ok response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(Object.fromEntries(EMOJIS.map((e) => [e, 0]))))
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'invalid emoji' }) } as Response);
    vi.stubGlobal('fetch', fetchMock);

    render(<EmojiReactionBar />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'React with 👍' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByRole('button', { name: 'React with 👍' })).toHaveTextContent('0');
  });
});
