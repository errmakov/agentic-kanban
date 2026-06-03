import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import feature from './index';

const EMOJIS = ['👍', '❤️', '🎉', '🚀'];

describe('EmojiReactionBar', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ '👍': 0, '❤️': 0, '🎉': 0, '🚀': 0 }),
    });
  });

  it('renders the four emoji buttons', async () => {
    const { Component } = feature;
    render(<Component />);
    for (const emoji of EMOJIS) {
      expect(
        await screen.findByRole('button', { name: `React with ${emoji}` }),
      ).toBeInTheDocument();
    }
  });

  it('fetches counts on mount and displays them', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ '👍': 5, '❤️': 3, '🎉': 7, '🚀': 2 }),
    });
    const { Component } = feature;
    render(<Component />);
    expect(await screen.findByRole('button', { name: 'React with 👍' })).toHaveTextContent('5');
    expect(screen.getByRole('button', { name: 'React with ❤️' })).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: 'React with 🎉' })).toHaveTextContent('7');
    expect(screen.getByRole('button', { name: 'React with 🚀' })).toHaveTextContent('2');
  });

  it('shows zero counts before the initial fetch resolves', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    const { Component } = feature;
    render(<Component />);
    for (const emoji of EMOJIS) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toHaveTextContent('0');
    }
  });

  it('posts the emoji when a button is clicked', async () => {
    const { Component } = feature;
    render(<Component />);
    const button = await screen.findByRole('button', { name: 'React with 👍' });
    fireEvent.click(button);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji: '👍' }),
      });
    });
  });

  it('optimistically increments the count before the server responds', async () => {
    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((res) => { resolvePost = res; });
    global.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST') {
        return postPromise.then(() => ({ json: async () => ({ '👍': 1, '❤️': 0, '🎉': 0, '🚀': 0 }) }));
      }
      return Promise.resolve({ json: async () => ({ '👍': 0, '❤️': 0, '🎉': 0, '🚀': 0 }) });
    });

    const { Component } = feature;
    render(<Component />);
    const button = await screen.findByRole('button', { name: 'React with 👍' });
    expect(button).toHaveTextContent('0');

    fireEvent.click(button);
    // Optimistic update shows 1 immediately, before POST resolves
    await waitFor(() => expect(button).toHaveTextContent('1'));

    // Now resolve the POST — server confirms the count
    await act(async () => { resolvePost!(undefined); });
    await waitFor(() => expect(button).toHaveTextContent('1'));
  });

  it('reconciles count with server response after POST', async () => {
    // Server returns a count higher than what client has (e.g. another visitor also clicked)
    global.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST') {
        return Promise.resolve({ json: async () => ({ '👍': 42, '❤️': 0, '🎉': 0, '🚀': 0 }) });
      }
      return Promise.resolve({ json: async () => ({ '👍': 0, '❤️': 0, '🎉': 0, '🚀': 0 }) });
    });

    const { Component } = feature;
    render(<Component />);
    const button = await screen.findByRole('button', { name: 'React with 👍' });
    fireEvent.click(button);
    // After server responds, count should match server value (42)
    await waitFor(() => expect(button).toHaveTextContent('42'));
  });

  it('re-fetches GET to restore state when POST fails', async () => {
    global.fetch = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST') {
        return Promise.reject(new Error('network error'));
      }
      return Promise.resolve({ json: async () => ({ '👍': 7, '❤️': 0, '🎉': 0, '🚀': 0 }) });
    });

    const { Component } = feature;
    render(<Component />);
    const button = await screen.findByRole('button', { name: 'React with 👍' });

    fireEvent.click(button);
    // After POST failure, GET should restore the true server count (7)
    await waitFor(() => expect(button).toHaveTextContent('7'));
  });

  it('has the correct feature descriptor', () => {
    expect(feature.id).toBe('emoji-reaction-bar');
    expect(feature.slot).toBe('main');
    expect(feature.order).toBe(10);
    expect(feature.Component).toBeDefined();
  });
});
