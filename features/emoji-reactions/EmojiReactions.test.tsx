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

  it('shows 0 for all emojis when server returns empty counts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ counts: {} }) }),
    );
    render(<EmojiReactions />);
    await waitFor(() => {
      for (const emoji of EMOJIS) {
        expect(screen.getByLabelText(`React with ${emoji}`).textContent).toContain('0');
      }
    });
  });

  it('increments count optimistically before POST responds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') return new Promise(() => {}); // never resolves
        return Promise.resolve({ ok: true, json: async () => ({ counts: {} }) });
      }),
    );
    render(<EmojiReactions />);
    await waitFor(() =>
      expect(screen.getByLabelText('React with 👍').textContent).toContain('0'),
    );
    fireEvent.click(screen.getByLabelText('React with 👍'));
    await waitFor(() =>
      expect(screen.getByLabelText('React with 👍').textContent).toContain('1'),
    );
  });

  it('syncs count from server response after POST', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ counts: { '👍': 10, '❤️': 0, '🔥': 0, '🤔': 0, '👏': 0 } }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ counts: {} }) });
      }),
    );
    render(<EmojiReactions />);
    await waitFor(() =>
      expect(screen.getByLabelText('React with 👍').textContent).toContain('0'),
    );
    fireEvent.click(screen.getByLabelText('React with 👍'));
    await waitFor(() =>
      expect(screen.getByLabelText('React with 👍').textContent).toContain('10'),
    );
  });

  it('does not crash when initial fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<EmojiReactions />);
    for (const emoji of EMOJIS) {
      expect(screen.getByLabelText(`React with ${emoji}`)).toBeInTheDocument();
      expect(screen.getByLabelText(`React with ${emoji}`).textContent).toContain('0');
    }
  });

  it('keeps optimistic count when POST fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') return Promise.reject(new Error('Network error'));
        return Promise.resolve({ ok: true, json: async () => ({ counts: {} }) });
      }),
    );
    render(<EmojiReactions />);
    await waitFor(() =>
      expect(screen.getByLabelText('React with 🔥').textContent).toContain('0'),
    );
    fireEvent.click(screen.getByLabelText('React with 🔥'));
    await waitFor(() =>
      expect(screen.getByLabelText('React with 🔥').textContent).toContain('1'),
    );
  });
});
