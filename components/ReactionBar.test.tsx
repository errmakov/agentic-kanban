import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReactionBar, EMOJIS } from './ReactionBar';

describe('ReactionBar', () => {
  beforeEach(() => {
    const payload = Object.fromEntries(EMOJIS.map((e) => [e, 0]));
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(payload) } as Response),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button for every emoji', async () => {
    render(<ReactionBar />);
    for (const emoji of EMOJIS) {
      expect(
        screen.getByRole('button', { name: new RegExp(`react with ${emoji}`, 'i') }),
      ).toBeInTheDocument();
    }
  });

  it('POSTs the tapped emoji to the API', async () => {
    render(<ReactionBar />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/reactions'));

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(`react with ${EMOJIS[0]}`, 'i') }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/reactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ emoji: EMOJIS[0] }),
      }),
    );
  });

  it('displays counts loaded from the server', async () => {
    const serverCounts = Object.fromEntries(EMOJIS.map((e, i) => [e, (i + 1) * 3]));
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(serverCounts) } as Response),
    );

    render(<ReactionBar />);

    for (const emoji of EMOJIS) {
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: new RegExp(`react with ${emoji}`, 'i') }),
        ).toHaveTextContent(String(serverCounts[emoji])),
      );
    }
  });

  it('optimistically increments the count before the server responds', async () => {
    global.fetch = vi.fn((_url: RequestInfo | URL, opts?: RequestInit) => {
      if (!opts) {
        return Promise.resolve({
          json: () => Promise.resolve(Object.fromEntries(EMOJIS.map((e) => [e, 0]))),
        } as Response);
      }
      return new Promise<Response>(() => {});
    });

    render(<ReactionBar />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/reactions'));

    const button = screen.getByRole('button', { name: new RegExp(`react with ${EMOJIS[0]}`, 'i') });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveTextContent('1');
  });

  it('reconciles the count with the server response after POST', async () => {
    const serverCounts = Object.fromEntries(EMOJIS.map((e) => [e, 10]));
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(serverCounts) } as Response),
    );

    render(<ReactionBar />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/reactions'));

    const button = screen.getByRole('button', { name: new RegExp(`react with ${EMOJIS[0]}`, 'i') });
    fireEvent.click(button);

    await waitFor(() => expect(button).toHaveTextContent('10'));
  });
});
