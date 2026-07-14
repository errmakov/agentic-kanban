import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature, { LiveClock } from './index';

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T14:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the current time in HH:MM:SS after mount', () => {
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByText('14:30:00')).toBeInTheDocument();
  });

  it('advances the displayed time by one second each second', () => {
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByText('14:30:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('14:30:01')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('14:30:02')).toBeInTheDocument();
  });

  it('clears the interval on unmount (no leaked timer)', () => {
    const clearSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = render(<LiveClock />);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('exposes a valid feature descriptor', () => {
    expect(feature.id).toBe('live-clock');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(20);
    expect(typeof feature.Component).toBe('function');
  });
});
