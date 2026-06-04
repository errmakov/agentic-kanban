import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmojiReactionBar } from './index';
import feature from './index';

const mockCounts: Record<string, number> = { '👍': 3, '❤️': 1, '😂': 0, '🎉': 5, '🤯': 2 };

function makeFetchMock(opts?: { postRejects?: boolean }) {
  return vi.fn((url: string, init?: RequestInit) => {
    if (!init || init.method !== 'POST') {
      return Promise.resolve({ json: () => Promise.resolve({ counts: mockCounts }) });
    }
    if (opts?.postRejects) {
      return Promise.reject(new Error('Network error'));
    }
    const body = JSON.parse(init.body as string);
    const updated = { ...mockCounts, [body.emoji]: (mockCounts[body.emoji] ?? 0) + 1 };
    return Promise.resolve({ json: () => Promise.resolve({ counts: updated }) });
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', makeFetchMock());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('EmojiReactionBar', () => {
  it('renders all emoji buttons', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => {
      expect(screen.getByLabelText('React with 👍')).toBeInTheDocument();
      expect(screen.getByLabelText('React with ❤️')).toBeInTheDocument();
      expect(screen.getByLabelText('React with 😂')).toBeInTheDocument();
      expect(screen.getByLabelText('React with 🎉')).toBeInTheDocument();
      expect(screen.getByLabelText('React with 🤯')).toBeInTheDocument();
    });
  });

  it('calls POST with correct emoji when a button is clicked', async () => {
    render(<EmojiReactionBar />);
    await waitFor(() => screen.getByLabelText('React with 🎉'));

    fireEvent.click(screen.getByLabelText('React with 🎉'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji: '🎉' }),
      });
    });
  });

  it('displays counts fetched from the server', async () => {
    render(<EmojiReactionBar />);
    const button = await screen.findByLabelText('React with 👍');
    await waitFor(() => {
      expect(within(button).getByText('3')).toBeInTheDocument();
    });
  });

  it('optimistically increments count before server responds', async () => {
    // Keep POST pending so we observe the intermediate optimistic state
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        if (!init || init.method !== 'POST') {
          return Promise.resolve({ json: () => Promise.resolve({ counts: mockCounts }) });
        }
        return new Promise(() => {});
      }),
    );

    render(<EmojiReactionBar />);
    const button = screen.getByLabelText('React with 🎉');
    await waitFor(() => expect(within(button).getByText('5')).toBeInTheDocument());

    fireEvent.click(button);

    expect(within(button).getByText('6')).toBeInTheDocument();
  });

  it('rolls back optimistic increment when POST fails', async () => {
    vi.stubGlobal('fetch', makeFetchMock({ postRejects: true }));

    render(<EmojiReactionBar />);
    const button = screen.getByLabelText('React with 🎉');
    await waitFor(() => expect(within(button).getByText('5')).toBeInTheDocument());

    fireEvent.click(button);
    expect(within(button).getByText('6')).toBeInTheDocument();

    await waitFor(() => expect(within(button).getByText('5')).toBeInTheDocument());
  });

  it('has the correct feature descriptor', () => {
    expect(feature.id).toBe('emoji-reactions');
    expect(feature.slot).toBe('main');
    expect(feature.order).toBe(10);
    expect(feature.Component).toBe(EmojiReactionBar);
  });
});
