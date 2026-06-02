import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
});
