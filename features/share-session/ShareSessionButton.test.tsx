import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import feature from './index';

const ShareSessionButton = feature.Component;

describe('ShareSessionButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a share button', () => {
    render(<ShareSessionButton />);
    expect(
      screen.getByRole('button', { name: /copy link to this session/i }),
    ).toBeInTheDocument();
  });

  it('writes the page URL to the clipboard on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareSessionButton />);
    fireEvent.click(
      screen.getByRole('button', { name: /copy link to this session/i }),
    );

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(window.location.href));
  });

  it('shows transient feedback after a successful copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareSessionButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });
    expect(button.textContent).toContain('Share');

    fireEvent.click(button);

    await waitFor(() => expect(button.textContent).toContain('Copied!'));
  });

  it('does not throw when the clipboard API is unavailable', () => {
    vi.stubGlobal('navigator', {});

    render(<ShareSessionButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });

    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it('does not show copied feedback when clipboard write is rejected', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareSessionButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });

    fireEvent.click(button);

    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(button.textContent).toContain('Share');
    expect(button.textContent).not.toContain('Copied!');
  });

  it('reverts feedback label back to Share after 2 seconds', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    render(<ShareSessionButton />);
    const button = screen.getByRole('button', { name: /copy link to this session/i });

    fireEvent.click(button);

    // Flush pending promises so the clipboard mock resolves and setCopied(true) runs
    await act(async () => {});

    expect(button.textContent).toContain('Copied!');

    // Advance fake time past the 2-second reset
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(button.textContent).toContain('Share');
    expect(button.textContent).not.toContain('Copied!');
    vi.useRealTimers();
  });

  it('exports correct feature descriptor properties', () => {
    expect(feature.id).toBe('share-session');
    expect(feature.slot).toBe('footer');
    expect(feature.order).toBe(10);
  });
});
