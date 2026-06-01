import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BreakCountdown } from './BreakCountdown';

describe('BreakCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the "Next break" heading', () => {
    vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0));
    render(<BreakCountdown />);
    expect(
      screen.getByRole('heading', { name: /next break/i }),
    ).toBeInTheDocument();
  });

  it('shows a formatted countdown when a future break is scheduled', () => {
    // 10:29:00 — one minute before the 10:30 morning break.
    vi.setSystemTime(new Date(2026, 5, 1, 10, 29, 0));
    render(<BreakCountdown />);
    expect(screen.getByText(/morning break/i)).toBeInTheDocument();
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('advances to the next break when one has passed', () => {
    // 11:00 — morning break is gone, lunch (12:30) is next, 1h30m away.
    vi.setSystemTime(new Date(2026, 5, 1, 11, 0, 0));
    render(<BreakCountdown />);
    expect(screen.getByText(/lunch/i)).toBeInTheDocument();
    expect(screen.getByText('1:30:00')).toBeInTheDocument();
  });

  it('shows the fallback when all breaks have passed', () => {
    vi.setSystemTime(new Date(2026, 5, 1, 23, 0, 0));
    render(<BreakCountdown />);
    expect(screen.getByText(/no more breaks today/i)).toBeInTheDocument();
  });
});
