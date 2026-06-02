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
});
