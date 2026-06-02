import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ShareButton } from './ShareButton';

describe('ShareButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders an accessible share button', () => {
    render(<ShareButton />);
    expect(
      screen.getByRole('button', { name: /copy session link/i }),
    ).toBeInTheDocument();
  });

  it('copies the current page URL to the clipboard on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareButton />);
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /copy session link/i }),
      );
    });

    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });

  it('shows "Copied!" after a successful copy and reverts after ~2s', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareButton />);
    const button = screen.getByRole('button', { name: /copy session link/i });

    expect(button).toHaveTextContent(/share/i);

    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveTextContent(/copied/i);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(button).toHaveTextContent(/share/i);
  });

  it('does not crash or change label when the clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareButton />);
    const button = screen.getByRole('button', { name: /copy session link/i });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveTextContent(/share/i);
  });
});
