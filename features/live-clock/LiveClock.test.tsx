import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LiveClock } from './index';
import feature from './index';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('LiveClock', () => {
  it('renders a placeholder (--:--:--) before timers fire', () => {
    render(<LiveClock />);
    expect(screen.getByRole('time').textContent).toBe('--:--:--');
  });

  it('renders a time string after the initial setTimeout fires', () => {
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole('time').textContent).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  it('updates the displayed time after 1 second', () => {
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    const before = screen.getByRole('time').textContent;
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const after = screen.getByRole('time').textContent;
    expect(typeof after).toBe('string');
    expect(after).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    expect(before).toBeDefined();
  });

  it('clears interval and timeout on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    const intervalsBefore = clearIntervalSpy.mock.calls.length;
    const timeoutsBefore = clearTimeoutSpy.mock.calls.length;
    unmount();
    expect(clearIntervalSpy.mock.calls.length - intervalsBefore).toBe(1);
    expect(clearTimeoutSpy.mock.calls.length - timeoutsBefore).toBe(1);
  });
});

describe('live-clock feature descriptor', () => {
  it('has id "live-clock"', () => {
    expect(feature.id).toBe('live-clock');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 20', () => {
    expect(feature.order).toBe(20);
  });

  it('exposes the LiveClock component', () => {
    expect(feature.Component).toBe(LiveClock);
  });
});
