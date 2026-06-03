import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShareButton } from './index';
import feature from './index';

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: 'http://localhost:3000/' },
  });
});

describe('ShareButton', () => {
  it('renders a button with an accessible label', () => {
    render(<ShareButton />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label');
  });

  it('shows "Share" initially', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button').textContent).toBe('Share');
  });

  it('calls clipboard.writeText with window.location.href on click', async () => {
    render(<ShareButton />);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/');
  });

  it('changes label and text to "Copied!" after click', async () => {
    render(<ShareButton />);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('Copied!');
    expect(btn).toHaveAttribute('aria-label', 'Link copied to clipboard');
  });

  it('reverts to "Share" after 2 seconds', async () => {
    render(<ShareButton />);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    expect(screen.getByRole('button').textContent).toBe('Copied!');
    await act(async () => { vi.advanceTimersByTime(2000); });
    expect(screen.getByRole('button').textContent).toBe('Share');
  });

  it('clears previous timer on rapid repeated clicks', async () => {
    render(<ShareButton />);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    await act(async () => { vi.advanceTimersByTime(1000); });
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    await act(async () => { vi.advanceTimersByTime(1500); });
    // still copied because second click reset the timer
    expect(screen.getByRole('button').textContent).toBe('Copied!');
    await act(async () => { vi.advanceTimersByTime(600); });
    expect(screen.getByRole('button').textContent).toBe('Share');
  });

  it('does not throw when clipboard.writeText rejects', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    render(<ShareButton />);
    await expect(
      act(async () => { fireEvent.click(screen.getByRole('button')); })
    ).resolves.not.toThrow();
    expect(screen.getByRole('button').textContent).toBe('Share');
  });

  it('does not throw when clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { writable: true, value: undefined });
    render(<ShareButton />);
    await expect(
      act(async () => { fireEvent.click(screen.getByRole('button')); })
    ).resolves.not.toThrow();
  });
});

describe('ShareButton feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('share-button');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 20', () => {
    expect(feature.order).toBe(20);
  });

  it('exports the ShareButton component', () => {
    expect(feature.Component).toBe(ShareButton);
  });
});
