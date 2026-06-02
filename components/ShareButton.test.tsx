import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShareButton } from './ShareButton';

describe('ShareButton', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://factorywall.example/session' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an accessible share button', () => {
    render(<ShareButton />);
    expect(
      screen.getByRole('button', { name: /copy session link/i }),
    ).toBeInTheDocument();
  });

  it('shows "🔗 Share" as the initial button text', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button').textContent).toBe('🔗 Share');
  });

  it('copies the current URL and shows feedback when clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<ShareButton />);
    fireEvent.click(screen.getByRole('button', { name: /copy session link/i }));

    expect(writeText).toHaveBeenCalledWith('https://factorywall.example/session');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /link copied!/i }),
      ).toBeInTheDocument(),
    );
  });

  it('reverts button label to "Share" after 2 seconds', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<ShareButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy session link/i }));
      // flush microtasks so the resolved clipboard promise settles
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: /link copied!/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: /copy session link/i })).toBeInTheDocument();
  });

  it('does nothing when navigator.clipboard is unavailable', () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    render(<ShareButton />);
    fireEvent.click(screen.getByRole('button', { name: /copy session link/i }));

    // State should remain unchanged — button stays in "Share" state
    expect(screen.getByRole('button', { name: /copy session link/i })).toBeInTheDocument();
  });

  it('does nothing when clipboard.writeText rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('permission denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<ShareButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy session link/i }));
      await Promise.resolve();
      await Promise.resolve();
    });

    // Button should stay in "Share" state — the catch block returns early
    expect(screen.getByRole('button', { name: /copy session link/i })).toBeInTheDocument();
  });

  it('resets the revert timer when clicked again before it expires', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    render(<ShareButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy session link/i }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole('button', { name: /link copied!/i })).toBeInTheDocument();

    // Advance 1 second — still in "Copied!" state
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByRole('button', { name: /link copied!/i })).toBeInTheDocument();

    // Second click — resets the 2-second countdown
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /link copied!/i }));
      await Promise.resolve();
      await Promise.resolve();
    });

    // Advance 1.5s — without the reset, the original timer (set 2.5s ago) would have fired
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByRole('button', { name: /link copied!/i })).toBeInTheDocument();

    // Advance the final 0.5s to reach 2s from the second click
    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.getByRole('button', { name: /copy session link/i })).toBeInTheDocument();
  });
});
