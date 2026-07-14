import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmojiReactionBar } from './index';

const initialCounts = { '👍': 3, '❤️': 1, '🔥': 0, '🎉': 5 };

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    const fetchMock = vi.fn(async () => ({
      json: async () => ({ counts: initialCounts }),
    }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders a button for every emoji', async () => {
    render(<EmojiReactionBar />);
    for (const emoji of ['👍', '❤️', '🔥', '🎉']) {
      expect(
        screen.getByRole('button', { name: `React with ${emoji}` }),
      ).toBeInTheDocument();
    }
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('shows the counts fetched from the API', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('POSTs the tapped emoji to the API', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'React with 🔥' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/emoji-reactions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ emoji: '🔥' }),
        }),
      );
    });
  });

  it('shows zero counts for all emojis when the initial GET fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    render(<EmojiReactionBar />);
    // Should not crash; buttons still render with zero counts
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    const zeroSpans = screen.getAllByText('0');
    expect(zeroSpans).toHaveLength(4);
  });

  it('updates the displayed count after a successful reaction', async () => {
    const updatedCounts = { '👍': 4, '❤️': 1, '🔥': 0, '🎉': 5 };
    vi.mocked(fetch)
      .mockResolvedValueOnce({ json: async () => ({ counts: initialCounts }) } as Response)
      .mockResolvedValueOnce({ json: async () => ({ counts: updatedCounts }) } as Response);

    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'React with 👍' }));

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
  });

  it('disables the button while its reaction is in-flight', async () => {
    let resolvePost!: (v: unknown) => void;
    const postPending = new Promise((res) => { resolvePost = res; });

    vi.mocked(fetch)
      .mockResolvedValueOnce({ json: async () => ({ counts: initialCounts }) } as Response)
      .mockReturnValueOnce(postPending as Promise<Response>);

    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    const btn = screen.getByRole('button', { name: 'React with 👍' });
    fireEvent.click(btn);

    await waitFor(() => expect(btn).toBeDisabled());

    // Resolve so the component can clean up pending state
    await act(async () => {
      resolvePost({ json: async () => ({ counts: initialCounts }) });
    });
  });

  it('does not POST again when the button is disabled (double-tap prevention)', async () => {
    let resolvePost!: (v: unknown) => void;
    const postPending = new Promise((res) => { resolvePost = res; });

    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce({ json: async () => ({ counts: initialCounts }) } as Response)
      .mockReturnValueOnce(postPending as Promise<Response>);

    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    const btn = screen.getByRole('button', { name: 'React with 👍' });
    fireEvent.click(btn);

    await waitFor(() => expect(btn).toBeDisabled());

    // Second tap on the now-disabled button — React will not fire onClick for disabled buttons
    fireEvent.click(btn);

    // Only 1 GET + 1 POST should have been fired (not a third call)
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolvePost({ json: async () => ({ counts: initialCounts }) });
    });
  });
});
