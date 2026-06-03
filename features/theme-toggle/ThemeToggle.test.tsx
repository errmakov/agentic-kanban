import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggle } from './index';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false }),
    );
  });

  it('renders a toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('defaults to light mode and offers to switch to dark', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles the dark class and aria-label on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('restores a stored dark preference on mount', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(
      screen.getByRole('button', { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });
});
