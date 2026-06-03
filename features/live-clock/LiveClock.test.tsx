import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveClock } from './index';
import feature from './index';

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
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
