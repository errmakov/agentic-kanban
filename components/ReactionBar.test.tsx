import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactionBar } from './ReactionBar';

const allZero = { '👍': 0, '❤️': 0, '🔥': 0, '👏': 0, '😂': 0 };

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

  it('renders all five emoji buttons', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => allZero,
    }) as unknown as typeof fetch;

    render(<ReactionBar />);

    for (const emoji of ['👍', '❤️', '🔥', '👏', '😂']) {
      expect(await screen.findByRole('button', { name: new RegExp(`react with ${emoji}`, 'i') })).toBeInTheDocument();
    }
  });

  it('renders nothing while initial data is loading', () => {
    // fetch never resolves during this test
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})) as unknown as typeof fetch;

    const { container } = render(<ReactionBar />);

    expect(container.firstChild).toBeNull();
  });

  it('POSTs to the API when a button is clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => allZero,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...allZero, '👍': 1 }),
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

  it('optimistically increments the count before the server responds', async () => {
    let resolvePost!: (v: { ok: boolean; json: () => Promise<typeof allZero> }) => void;
    const postPromise = new Promise<{ ok: boolean; json: () => Promise<typeof allZero> }>(
      (resolve) => { resolvePost = resolve; },
    );

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => allZero })
      .mockReturnValueOnce(postPromise) as unknown as typeof fetch;

    render(<ReactionBar />);
    const button = await screen.findByRole('button', { name: /react with 👍/i });

    fireEvent.click(button);

    // optimistic update visible immediately — before server responds
    expect(button).toHaveTextContent('1');

    await act(async () => {
      resolvePost({ ok: true, json: async () => ({ ...allZero, '👍': 1 }) });
    });
    expect(button).toHaveTextContent('1');
  });

  it('rolls back the count when the POST request fails', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...allZero, '👍': 2 }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'server error' }) }) as unknown as typeof fetch;

    render(<ReactionBar />);
    const button = await screen.findByRole('button', { name: /react with 👍/i });
    expect(button).toHaveTextContent('2');

    fireEvent.click(button);
    // optimistic update
    expect(button).toHaveTextContent('3');

    // rolled back after server error
    await waitFor(() => expect(button).toHaveTextContent('2'));
  });
});
