import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JumpToTop } from './index';
import feature from './index';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
}

describe('JumpToTop', () => {
  beforeEach(() => {
    setScrollY(0);
    vi.restoreAllMocks();
  });

  it('does not render the button when near the top of the page', () => {
    render(<JumpToTop />);
    expect(screen.queryByRole('button', { name: /back to top/i })).toBeNull();
  });

  it('shows the button after scrolling past the threshold', () => {
    render(<JumpToTop />);
    setScrollY(300);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(
      screen.getByRole('button', { name: /back to top/i }),
    ).toBeInTheDocument();
  });

  it('hides the button again when scrolling back near the top', () => {
    render(<JumpToTop />);
    setScrollY(300);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByRole('button', { name: /back to top/i })).toBeInTheDocument();

    setScrollY(0);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.queryByRole('button', { name: /back to top/i })).toBeNull();
  });

  it('smoothly scrolls to the top on click', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    render(<JumpToTop />);
    setScrollY(300);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    fireEvent.click(screen.getByRole('button', { name: /back to top/i }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});

describe('jump-to-top feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('jump-to-top');
  });

  it('is registered in the footer slot', () => {
    expect(feature.slot).toBe('footer');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });
});
