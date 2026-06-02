import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScrollToTop } from './ScrollToTop';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    value,
    writable: true,
    configurable: true,
  });
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setScrollY(0);
  });

  it('renders hidden when near the top', () => {
    render(<ScrollToTop />);
    const button = screen.getByRole('button', { name: 'Scroll to top' });
    expect(button.className).toContain('opacity-0');
    expect(button.className).toContain('pointer-events-none');
  });

  it('becomes visible after scrolling past the threshold', () => {
    render(<ScrollToTop />);
    setScrollY(301);
    fireEvent.scroll(window);
    const button = screen.getByRole('button', { name: 'Scroll to top' });
    expect(button.className).toContain('opacity-100');
  });

  it('scrolls to the top when clicked', () => {
    const scrollTo = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => {});
    render(<ScrollToTop />);
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to top' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('remains hidden when scrollY is exactly at the threshold (300)', () => {
    render(<ScrollToTop />);
    setScrollY(300);
    fireEvent.scroll(window);
    const button = screen.getByRole('button', { name: 'Scroll to top' });
    expect(button.className).toContain('opacity-0');
    expect(button.className).toContain('pointer-events-none');
  });

  it('hides again when scrolling back below the threshold', () => {
    render(<ScrollToTop />);
    setScrollY(400);
    fireEvent.scroll(window);
    const button = screen.getByRole('button', { name: 'Scroll to top' });
    expect(button.className).toContain('opacity-100');

    setScrollY(100);
    fireEvent.scroll(window);
    expect(button.className).toContain('opacity-0');
    expect(button.className).toContain('pointer-events-none');
  });

  it('removes the scroll listener on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<ScrollToTop />);
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
