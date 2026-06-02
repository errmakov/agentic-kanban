import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactionBar } from './ReactionBar';

describe('ReactionBar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all four emoji buttons with counts and increments on click', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ '👍': 2, '❤️': 0, '🎉': 0, '🤔': 0 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ReactionBar />);

    await waitFor(() => {
      expect(screen.getByLabelText('React with 👍')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('React with ❤️')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 🎉')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 🤔')).toBeInTheDocument();
    expect(screen.getByLabelText('React with 👍')).toHaveTextContent('2');

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ '👍': 3, '❤️': 0, '🎉': 0, '🤔': 0 }),
    });
    fireEvent.click(screen.getByLabelText('React with 👍'));

    await waitFor(() => {
      expect(screen.getByLabelText('React with 👍')).toHaveTextContent('3');
    });
  });

  it('shows zero counts for all emojis before the initial fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));

    render(<ReactionBar />);

    expect(screen.getByLabelText('React with 👍')).toHaveTextContent('0');
    expect(screen.getByLabelText('React with ❤️')).toHaveTextContent('0');
    expect(screen.getByLabelText('React with 🎉')).toHaveTextContent('0');
    expect(screen.getByLabelText('React with 🤔')).toHaveTextContent('0');
  });

  it('keeps zero counts when the initial fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(<ReactionBar />);

    await waitFor(() => {
      expect(screen.getByLabelText('React with 👍')).toHaveTextContent('0');
    });
    expect(screen.getByLabelText('React with ❤️')).toHaveTextContent('0');
    expect(screen.getByLabelText('React with 🎉')).toHaveTextContent('0');
    expect(screen.getByLabelText('React with 🤔')).toHaveTextContent('0');
  });

  it('does not update counts when the POST response is not ok', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ '👍': 1, '❤️': 0, '🎉': 0, '🤔': 0 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'server error' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<ReactionBar />);
    await waitFor(() => {
      expect(screen.getByLabelText('React with 👍')).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByLabelText('React with 👍'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByLabelText('React with 👍')).toHaveTextContent('1');
  });

  it('renders a group with the Reactions label for accessibility', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ '👍': 0, '❤️': 0, '🎉': 0, '🤔': 0 }),
    }));

    render(<ReactionBar />);

    expect(screen.getByRole('group', { name: 'Reactions' })).toBeInTheDocument();
  });

  it('sends a POST with the correct emoji when a button is clicked', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ '👍': 0, '❤️': 0, '🎉': 0, '🤔': 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ '👍': 0, '❤️': 1, '🎉': 0, '🤔': 0 }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<ReactionBar />);
    await waitFor(() => {
      expect(screen.getByLabelText('React with ❤️')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('React with ❤️'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/reactions', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ emoji: '❤️' }),
      }));
    });
    expect(screen.getByLabelText('React with ❤️')).toHaveTextContent('1');
  });
});
