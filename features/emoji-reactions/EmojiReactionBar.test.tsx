import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import feature from './index';

const EmojiReactionBar = feature.Component;

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders all six emoji buttons', () => {
    render(<EmojiReactionBar />);
    for (const emoji of ['👍', '❤️', '😂', '🔥', '🎉', '🤯']) {
      expect(
        screen.getByRole('button', { name: `React with ${emoji}` }),
      ).toBeInTheDocument();
    }
  });

  it('shows count 0 before the fetch resolves', () => {
    render(<EmojiReactionBar />);
    expect(screen.getAllByText('0')).toHaveLength(6);
  });

  it('shows the fetched counts once the GET resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ '👍': 7 }) })),
    );
    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument());
  });

  it('optimistically increments the count immediately on click', async () => {
    let resolvePost!: (v: unknown) => void;
    const pendingPost = new Promise((res) => { resolvePost = res; });

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') return pendingPost;
        return Promise.resolve({ json: () => Promise.resolve({ '👍': 3 }) });
      }),
    );

    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'React with 👍' }));

    expect(screen.getByText('4')).toBeInTheDocument();

    resolvePost(undefined);
  });

  it('updates to server-authoritative count after a successful POST', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ '👍': 99, '❤️': 0, '😂': 0, '🔥': 0, '🎉': 0, '🤯': 0 }),
          });
        }
        return Promise.resolve({ json: () => Promise.resolve({ '👍': 5 }) });
      }),
    );

    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'React with 👍' }));

    await waitFor(() => expect(screen.getByText('99')).toBeInTheDocument());
  });

  it('rolls back the optimistic count when the POST fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') {
          return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
        }
        return Promise.resolve({ json: () => Promise.resolve({ '👍': 5 }) });
      }),
    );

    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'React with 👍' }));
    expect(screen.getByText('6')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('rolls back the optimistic count when the POST throws a network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') return Promise.reject(new Error('network'));
        return Promise.resolve({ json: () => Promise.resolve({ '👍': 2 }) });
      }),
    );

    render(<EmojiReactionBar />);
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'React with 👍' }));
    expect(screen.getByText('3')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });
});

describe('feature descriptor', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('emoji-reactions');
    expect(feature.slot).toBe('main');
    expect(feature.order).toBe(50);
  });
});
