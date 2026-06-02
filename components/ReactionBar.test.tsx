import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactionBar } from './ReactionBar';

describe('ReactionBar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an emoji button with its count once loaded', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ '👍': 3, '❤️': 0, '🔥': 0, '👏': 0, '😂': 0 }),
    }) as unknown as typeof fetch;

    render(<ReactionBar />);

    const button = await screen.findByRole('button', { name: /react with 👍/i });
    expect(button).toHaveTextContent('3');
  });

  it('POSTs to the API when a button is clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ '👍': 0, '❤️': 0, '🔥': 0, '👏': 0, '😂': 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ '👍': 1, '❤️': 0, '🔥': 0, '👏': 0, '😂': 0 }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReactionBar />);

    const button = await screen.findByRole('button', { name: /react with 👍/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/reactions',
        expect.objectContaining({ method: 'POST' }),
      ),
    );
  });
});
