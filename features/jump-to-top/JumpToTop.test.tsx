import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JumpToTop } from './index';

describe('JumpToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    window.scrollTo = vi.fn();
  });

  it('renders a scroll-to-top button', () => {
    render(<JumpToTop />);
    expect(screen.getByRole('button', { name: /scroll to top/i })).toBeInTheDocument();
  });

  it('button is hidden when near top', () => {
    render(<JumpToTop />);
    const button = screen.getByRole('button', { name: /scroll to top/i });
    expect(button.className).toContain('opacity-0');
  });

  it('button becomes visible after scrolling down', () => {
    render(<JumpToTop />);
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 400 });
    fireEvent.scroll(window);
    const button = screen.getByRole('button', { name: /scroll to top/i });
    expect(button.className).toContain('opacity-100');
  });

  it('calls scrollTo on click', () => {
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 400 });
    render(<JumpToTop />);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole('button', { name: /scroll to top/i }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
