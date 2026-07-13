import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LiveClock } from './index';
import feature from './index';

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T09:08:07'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a semantic time element', () => {
    let container: HTMLElement;
    act(() => {
      ({ container } = render(<LiveClock />));
    });
    expect(container!.querySelector('time')).toBeInTheDocument();
  });

  it('displays the current time in HH:MM:SS after mount', () => {
    act(() => {
      render(<LiveClock />);
    });
    expect(screen.getByText('09:08:07')).toBeInTheDocument();
  });

  it('updates the time after one second', () => {
    act(() => {
      render(<LiveClock />);
    });
    expect(screen.getByText('09:08:07')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('09:08:08')).toBeInTheDocument();
  });

  it('displays PM hours in 24-hour format without AM/PM suffix', () => {
    vi.setSystemTime(new Date('2026-07-13T13:05:02'));
    act(() => {
      render(<LiveClock />);
    });
    expect(screen.getByText('13:05:02')).toBeInTheDocument();
  });

  it('clears the interval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    let unmount: () => void;
    act(() => {
      ({ unmount } = render(<LiveClock />));
    });
    act(() => {
      unmount!();
    });
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

describe('live-clock feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('live-clock');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 200', () => {
    expect(feature.order).toBe(200);
  });
});
