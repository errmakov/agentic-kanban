import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JumpToTop } from './index';

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
  window.scrollTo = vi.fn();
});

describe('JumpToTop', () => {
  it('renders a button with aria-label "Back to top"', () => {
    render(<JumpToTop />);
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('is hidden when scrollY <= 200', () => {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
    render(<JumpToTop />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.className).toContain('opacity-0');
    expect(button.className).toContain('pointer-events-none');
  });

  it('becomes visible when scrollY > 200', () => {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 201 });
    render(<JumpToTop />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.className).toContain('opacity-100');
    expect(button.className).not.toContain('pointer-events-none');
  });

  it('shows when scroll event fires with scrollY > 200', () => {
    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 300 });
      fireEvent.scroll(window);
    });
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.className).toContain('opacity-100');
  });

  it('hides when scroll event fires with scrollY <= 200', () => {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 300 });
    render(<JumpToTop />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 100 });
      fireEvent.scroll(window);
    });
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.className).toContain('opacity-0');
  });

  it('calls window.scrollTo with top:0 smooth on click', () => {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 300 });
    render(<JumpToTop />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
