import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareButton } from './index';

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, 'location', {
    value: { href: 'https://example.com/session' },
    writable: true,
    configurable: true,
  });
});

describe('ShareButton', () => {
  it('renders a Copy link button', () => {
    render(<ShareButton />);
    expect(screen.getByRole('button', { name: 'Copy link to this session' })).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
  });

  it('calls clipboard.writeText with window.location.href on click', async () => {
    render(<ShareButton />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/session');
    });
  });

  it('shows "Copied!" after clicking', async () => {
    render(<ShareButton />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('reverts to "Copy link" after 2 seconds', async () => {
    vi.useFakeTimers();
    render(<ShareButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
