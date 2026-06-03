import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggle } from './index';
import feature from './index';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: false }),
  });
});

describe('ThemeToggle', () => {
  it('renders a button with an accessible label', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });

  it('starts in light mode with moon icon and correct aria-label', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(btn.textContent).toBe('☾');
  });

  it('toggles aria-label and dark class on click', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Switch to dark mode');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-label', 'Switch to light mode');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-label', 'Switch to dark mode');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('shows sun icon in dark mode and moon icon in light mode', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('☾');
    fireEvent.click(btn);
    expect(btn.textContent).toBe('☀');
    fireEvent.click(btn);
    expect(btn.textContent).toBe('☾');
  });

  it('persists theme choice to localStorage', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('restores dark mode from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('stays in light mode when localStorage theme is "light"', () => {
    localStorage.setItem('theme', 'light');
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('applies dark mode from prefers-color-scheme on first visit', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('does not apply dark mode when prefers-color-scheme is light on first visit', () => {
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('falls back to prefers-color-scheme when localStorage throws', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    getItemSpy.mockRestore();
  });

  it('does not throw when localStorage.setItem fails (private browsing)', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    render(<ThemeToggle />);
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    setItemSpy.mockRestore();
  });
});

describe('ThemeToggle feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('theme-toggle');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 10 to render before other header features', () => {
    expect(feature.order).toBe(10);
  });
});
