import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an accessible toggle button', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /toggle dark mode/i }),
    ).toBeInTheDocument();
  });

  it('toggles the dark class and persists the choice on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('applies the dark class when html element already has dark class (pre-paint script)', () => {
    // Simulate the inline script having applied the class before React mounted
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);

    // Toggling from an already-dark page should remove the class
    const button = screen.getByRole('button', { name: /toggle dark mode/i });
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('still toggles in-session when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });

    // Should not throw, and DOM class should still toggle
    expect(() => fireEvent.click(button)).not.toThrow();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('writes "dark" to localStorage when switching to dark', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /toggle dark mode/i }));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('writes "light" to localStorage when switching back to light', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /toggle dark mode/i }));
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
