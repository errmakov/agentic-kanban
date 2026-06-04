import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ShareSessionButton } from './index';

function mockClipboard(impl: { writeText: ReturnType<typeof vi.fn> }) {
  Object.defineProperty(navigator, 'clipboard', {
    value: impl,
    writable: true,
    configurable: true,
  });
}

describe('ShareSessionButton', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a Share button', () => {
    render(<ShareSessionButton />);
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('writes the current URL to the clipboard and shows "Copied!"', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard({ writeText });

    render(<ShareSessionButton />);
    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument(),
    );
  });

  it('stays as "Share" when clipboard API throws (unavailable/denied)', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    mockClipboard({ writeText });

    render(<ShareSessionButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
    });

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copied!/i })).not.toBeInTheDocument();
  });

  it('reverts label from "Copied!" back to "Share" after 2 seconds', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard({ writeText });

    render(<ShareSessionButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
    });

    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000));

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copied!/i })).not.toBeInTheDocument();
  });

  it('resets the 2-second timer on rapid double-click so "Copied!" does not revert prematurely', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard({ writeText });

    render(<ShareSessionButton />);

    // First click — enters "Copied!" state
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
    });
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();

    // Advance 1.5 s — still within the first 2 s window
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();

    // Second click resets the countdown
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copied!/i }));
    });
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();

    // Advance 1.5 s more — only 1.5 s since the second click; should still be "Copied!"
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();

    // Advance remaining 0.5 s — total 2 s since second click; should now revert
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });
});
