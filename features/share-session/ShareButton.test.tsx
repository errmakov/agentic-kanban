import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ShareButton } from './ShareButton';
import feature from './index';

describe('ShareButton', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders with an accessible name', () => {
    render(<ShareButton />);
    expect(
      screen.getByRole('button', { name: /copy link to this session/i }),
    ).toBeInTheDocument();
  });

  it('shows "Share" as the initial label', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button', { name: /copy link to this session/i })).toHaveTextContent('Share');
  });

  it('copies the page URL and shows "Copied!" on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });
    expect(button).toHaveTextContent('Share');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() => expect(button).toHaveTextContent('Copied!'));
  });

  it('reverts label back to "Share" after 2 seconds', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });

    await act(async () => {
      fireEvent.click(button);
      // Flush the resolved clipboard promise so setCopied(true) fires
      await Promise.resolve();
    });

    expect(button).toHaveTextContent('Copied!');

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(button).toHaveTextContent('Share');
  });

  it('silently ignores clipboard errors and keeps label as "Share"', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveTextContent('Share');
  });

  it('silently ignores missing clipboard API and keeps label as "Share"', async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

    render(<ShareButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveTextContent('Share');

    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
  });
});

describe('ShareButton feature descriptor', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('share-session');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(50);
  });

  it('exposes the ShareButton component', () => {
    expect(feature.Component).toBe(ShareButton);
  });
});
