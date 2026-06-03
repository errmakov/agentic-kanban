import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveClock } from './index';
import feature from './index';

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('displays the current time after initial render', () => {
    vi.setSystemTime(new Date(2026, 5, 3, 14, 5, 9));
    render(<LiveClock />);
    expect(screen.getByText('14:05:09')).toBeInTheDocument();
  });

  it('updates the displayed time after 1 second', () => {
    vi.setSystemTime(new Date(2026, 5, 3, 14, 5, 9));
    render(<LiveClock />);
    expect(screen.getByText('14:05:09')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('14:05:10')).toBeInTheDocument();
  });

  it('clears the interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = render(<LiveClock />);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('zero-pads single-digit hours, minutes, and seconds', () => {
    vi.setSystemTime(new Date(2026, 5, 3, 1, 2, 3));
    render(<LiveClock />);
    expect(screen.getByText('01:02:03')).toBeInTheDocument();
  });

  it('sets the dateTime attribute to the ISO string of the current time', () => {
    const now = new Date(2026, 5, 3, 14, 5, 9);
    vi.setSystemTime(now);
    render(<LiveClock />);
    const el = screen.getByRole('time');
    expect(el.getAttribute('dateTime')).toBe(now.toISOString());
  });
});

describe('feature descriptor', () => {
  it('has id "live-clock"', () => {
    expect(feature.id).toBe('live-clock');
  });

  it('is placed in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 20', () => {
    expect(feature.order).toBe(20);
  });

  it('exports LiveClock as the Component', () => {
    expect(feature.Component).toBe(LiveClock);
  });
});
