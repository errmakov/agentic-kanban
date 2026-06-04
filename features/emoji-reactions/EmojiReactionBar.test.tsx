import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmojiReactionBar } from './index';

const mockCounts: Record<string, number> = { '👍': 3, '❤️': 1, '😂': 0, '🎉': 5, '🤯': 2 };

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      if (!init || init.method !== 'POST') {
        return Promise.resolve({
          json: () => Promise.resolve({ counts: mockCounts }),
        });
      }
      const body = JSON.parse(init.body as string);
      const updated = { ...mockCounts, [body.emoji]: (mockCounts[body.emoji] ?? 0) + 1 };
      return Promise.resolve({
        json: () => Promise.resolve({ counts: updated }),
      });
    }),
  );
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
});
