import { render, screen, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature, { LiveClock } from './index';

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T14:30:00'));
  });

  afterEach(() => {
    cleanup(); // unmount while fake timers are still active, so clearInterval resolves correctly
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

  it('renders a <time> element with an ISO dateTime attribute after mount', () => {
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    const timeEl = document.querySelector('time');
    expect(timeEl).toBeInTheDocument();
    expect(timeEl).toHaveAttribute('dateTime', new Date('2026-01-01T14:30:00').toISOString());
  });

  it('updates the dateTime attribute as the clock ticks', () => {
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const timeEl = document.querySelector('time');
    expect(timeEl).toHaveAttribute('dateTime', new Date('2026-01-01T14:30:01').toISOString());
  });

  it('applies font-mono and tabular-nums classes for stable layout', () => {
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    const timeEl = document.querySelector('time');
    expect(timeEl?.className).toContain('font-mono');
    expect(timeEl?.className).toContain('tabular-nums');
  });

  it('formats midnight as 00:00:00', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00'));
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('formats end-of-day as 23:59:59', () => {
    vi.setSystemTime(new Date('2026-01-01T23:59:59'));
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByText('23:59:59')).toBeInTheDocument();
  });

  it('advances correctly across a minute boundary', () => {
    vi.setSystemTime(new Date('2026-01-01T14:30:59'));
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByText('14:30:59')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('14:31:00')).toBeInTheDocument();
  });

  it('advances correctly across an hour boundary', () => {
    vi.setSystemTime(new Date('2026-01-01T14:59:59'));
    render(<LiveClock />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByText('14:59:59')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('15:00:00')).toBeInTheDocument();
  });
});
