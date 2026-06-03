import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShareButton } from './index';

describe('ShareButton', () => {
  it('renders a Share button initially', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('writes the page url to the clipboard and shows "Copied!" on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument(),
    );
  });

  it('reverts to "Share" label after 2 s', async () => {
    vi.useFakeTimers();
    try {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      render(<ShareButton />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      // Flush the clipboard promise and resulting React state update
      await act(async () => {
        await writeText.mock.results[0].value;
      });

      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();

      // Advance past the 2000ms reset timer
      await act(async () => {
        vi.advanceTimersByTime(2001);
      });

      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  describe('when clipboard API is unavailable', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
        },
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('does not show "Copied!" when clipboard write fails', async () => {
      render(<ShareButton />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      // Give microtasks a chance to settle (the rejected promise)
      await act(async () => {});

      expect(screen.queryByRole('button', { name: /copied!/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });
  });
});
