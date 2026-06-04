import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { JumpToTop } from './index';
import feature from './index';

afterEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
});

describe('JumpToTop', () => {
  it('does not render the button when near the top', () => {
    render(<JumpToTop />);
    expect(
      screen.queryByRole('button', { name: /scroll back to top/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the button after scrolling past the threshold', () => {
    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
      fireEvent.scroll(window);
    });
    expect(
      screen.getByRole('button', { name: /scroll back to top/i }),
    ).toBeInTheDocument();
  });

  it('hides the button when scrolling back below the threshold', () => {
    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('button', { name: /scroll back to top/i })).toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 50, configurable: true });
      fireEvent.scroll(window);
    });
    expect(
      screen.queryByRole('button', { name: /scroll back to top/i }),
    ).not.toBeInTheDocument();
  });

  it('calls window.scrollTo with smooth behavior when clicked', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);

    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
      fireEvent.scroll(window);
    });

    fireEvent.click(screen.getByRole('button', { name: /scroll back to top/i }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    vi.unstubAllGlobals();
  });

  it('has an accessible aria-label', () => {
    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 300, configurable: true });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('button', { name: 'Scroll back to top' })).toBeInTheDocument();
  });

  it('has the correct feature descriptor', () => {
    expect(feature.id).toBe('jump-to-top');
    expect(feature.slot).toBe('footer');
    expect(feature.order).toBe(200);
    expect(feature.Component).toBe(JumpToTop);
  });
});
