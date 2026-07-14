import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import feature from './index';

const JumpToTop = feature.Component;

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    writable: true,
    value,
  });
}

describe('JumpToTop', () => {
  beforeEach(() => {
    setScrollY(0);
    window.scrollTo = vi.fn();
  });

  it('renders a scroll-to-top button', () => {
    render(<JumpToTop />);
    expect(
      screen.getByRole('button', { name: /scroll to top/i }),
    ).toBeInTheDocument();
  });

  it('is hidden when scrollY is at or below the threshold', () => {
    render(<JumpToTop />);
    const button = screen.getByRole('button', { name: /scroll to top/i });
    expect(button.className).toContain('opacity-0');
  });

  it('becomes visible once scrolled past the threshold', () => {
    render(<JumpToTop />);
    const button = screen.getByRole('button', { name: /scroll to top/i });

    act(() => {
      setScrollY(400);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(button.className).toContain('opacity-100');
  });

  it('scrolls to the top smoothly when clicked', () => {
    render(<JumpToTop />);
    const button = screen.getByRole('button', { name: /scroll to top/i });

    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('removes the scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<JumpToTop />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('exports correct feature descriptor properties', () => {
    expect(feature.id).toBe('jump-to-top');
    expect(feature.slot).toBe('main');
    expect(feature.order).toBe(999);
  });
});
