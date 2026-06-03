import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JumpToTop } from './index';

describe('JumpToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('does not render the button when scrollY is 0', () => {
    render(<JumpToTop />);
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
  });

  it('does not render the button when scrollY is exactly 300', () => {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 300 });
    render(<JumpToTop />);
    act(() => { fireEvent.scroll(window); });
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
  });

  it('renders the button when scrollY exceeds 300', () => {
    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 301 });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('clicking the button calls window.scrollTo with top:0 and smooth behavior', () => {
    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 400 });
      fireEvent.scroll(window);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('button has aria-label "Back to top"', () => {
    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 400 });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('button', { name: 'Back to top' })).toHaveAttribute('aria-label', 'Back to top');
  });
});
