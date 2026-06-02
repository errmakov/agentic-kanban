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
});
