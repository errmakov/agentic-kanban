import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReactionBar } from './ReactionBar';
import { EMOJIS } from '@/lib/emojis';

function mockFetch(getCounts: Record<string, number>) {
  return vi.fn((_url: string, init?: RequestInit) => {
    const body =
      init?.method === 'POST'
        ? { ...getCounts, '👍': (getCounts['👍'] ?? 0) + 1 }
        : getCounts;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    } as Response);
  });
}

describe('ReactionBar', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch({ '👍': 3 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a button for every emoji', async () => {
    render(<ReactionBar />);
    for (const emoji of EMOJIS) {
      expect(
        await screen.findByRole('button', { name: new RegExp(`React with ${emoji}`) }),
      ).toBeInTheDocument();
    }
  });

  it('displays counts from the fetched response', async () => {
    render(<ReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('POSTs the tapped emoji and updates its count', async () => {
    const fetchMock = mockFetch({ '👍': 3 });
    vi.stubGlobal('fetch', fetchMock);

    render(<ReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(
      screen.getByRole('button', { name: /React with 👍/ }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/reactions',
        expect.objectContaining({ method: 'POST' }),
      ),
    );
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
  });

  it('shows 0 for all emojis before the initial fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));
    render(<ReactionBar />);
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(EMOJIS.length);
  });

  it('disables the button while its POST request is in flight', async () => {
    let resolvePost!: (value: Response) => void;
    const postPromise = new Promise<Response>((r) => { resolvePost = r; });

    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') return postPromise;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ '👍': 3, '🎉': 0, '🤔': 0, '❤️': 0, '🚀': 0 }),
      } as Response);
    }));

    render(<ReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    const button = screen.getByRole('button', { name: /React with 👍/ });
    fireEvent.click(button);
    expect(button).toBeDisabled();

    resolvePost({
      ok: true,
      json: () => Promise.resolve({ '👍': 4, '🎉': 0, '🤔': 0, '❤️': 0, '🚀': 0 }),
    } as Response);

    await waitFor(() => expect(button).not.toBeDisabled());
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
  });

  it('leaves counts unchanged when the POST request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      if (init?.method === 'POST') return Promise.reject(new Error('Network error'));
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ '👍': 3, '🎉': 0, '🤔': 0, '❤️': 0, '🚀': 0 }),
      } as Response);
    }));

    render(<ReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /React with 👍/ }));

    // Button re-enables after the failed request finishes
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /React with 👍/ })).not.toBeDisabled(),
    );
    // Count must remain at 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
