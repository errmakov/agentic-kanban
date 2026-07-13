import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShareSessionButton } from './index';
import feature from './index';

describe('ShareSessionButton', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it('renders a share button', () => {
    render(<ShareSessionButton />);
    expect(screen.getByRole('button', { name: /share this session/i })).toBeInTheDocument();
  });

  it('copies the current URL and shows confirmation on click', async () => {
    render(<ShareSessionButton />);
    fireEvent.click(screen.getByRole('button', { name: /share this session/i }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() => {
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });

  it('reverts label back to Share after 2 seconds', async () => {
    vi.useFakeTimers();
    render(<ShareSessionButton />);

    // Flush async handleClick (clipboard.writeText resolves as microtask)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share this session/i }));
    });

    expect(screen.getByText(/copied!/i)).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('resets the 2-second timer on double-click', async () => {
    vi.useFakeTimers();
    render(<ShareSessionButton />);
    const button = screen.getByRole('button', { name: /share this session/i });

    await act(async () => { fireEvent.click(button); });
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();

    // Advance 1 second, then click again — timer should restart
    act(() => { vi.advanceTimersByTime(1000); });
    await act(async () => { fireEvent.click(button); });
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();

    // 1 more second (2 total since first click, 1 since second) — still Copied!
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();

    // Full 2 seconds from second click — reverts
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('does not show Copied! when clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('Not allowed')) },
    });

    render(<ShareSessionButton />);
    fireEvent.click(screen.getByRole('button', { name: /share this session/i }));

    // Wait a tick for the async handler to settle
    await act(async () => {});
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
  });

  it('does not throw when navigator.clipboard is undefined', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    render(<ShareSessionButton />);
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /share this session/i }))
    ).not.toThrow();

    await act(async () => {});
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
  });
});

describe('share-session feature descriptor', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('share-session');
    expect(feature.slot).toBe('footer');
    expect(feature.order).toBe(200);
  });

  it('uses ShareSessionButton as the Component', () => {
    expect(feature.Component).toBe(ShareSessionButton);
  });
});
