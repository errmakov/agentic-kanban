import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmojiReactions } from './index';

const EMOJIS = ['👍', '❤️', '🔥', '🤔', '👏'];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ counts: { '👍': 3, '❤️': 1, '🔥': 0, '🤔': 0, '👏': 0 } }),
    }),
  );
});

describe('EmojiReactions', () => {
  it('renders all five emoji buttons', async () => {
    render(<EmojiReactions />);
    for (const emoji of EMOJIS) {
      expect(screen.getByLabelText(`React with ${emoji}`)).toBeInTheDocument();
    }
  });

  it('shows counts fetched from the server', async () => {
    render(<EmojiReactions />);
    await waitFor(() => {
      expect(screen.getByLabelText('React with 👍').textContent).toContain('3');
    });
  });

  it('calls POST when a button is clicked', async () => {
    render(<EmojiReactions />);
    fireEvent.click(screen.getByLabelText('React with 🔥'));
    await waitFor(() => {
      const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls;
      const postCall = calls.find(
        (c: unknown[]) => typeof c[0] === 'string' && (c[1] as RequestInit)?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      expect(JSON.parse((postCall![1] as RequestInit).body as string)).toEqual({ emoji: '🔥' });
    });
  });
});
