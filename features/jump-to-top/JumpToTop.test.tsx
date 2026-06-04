import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { JumpToTop } from './index';

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
});
