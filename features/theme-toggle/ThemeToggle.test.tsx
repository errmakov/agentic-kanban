import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import feature from './index';

const ThemeToggle = feature.Component;

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('renders a toggle button', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /toggle dark mode/i }),
    ).toBeInTheDocument();
  });

  it('toggles the dark class on and off', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('shows moon icon in light mode and sun icon in dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(button.textContent).toContain('🌙');

    fireEvent.click(button);
    expect(button.textContent).toContain('☀️');
  });

  it('has aria-pressed reflecting the current theme state', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('initialises as dark when dark class is already on documentElement', () => {
    // Simulates the inline flash-prevention script having already set the class
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.textContent).toContain('☀️');
  });

  it('does not throw and still applies theme when localStorage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });

    expect(() => fireEvent.click(button)).not.toThrow();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    spy.mockRestore();
  });

  it('exports correct feature descriptor properties', () => {
    expect(feature.id).toBe('theme-toggle');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(10);
  });
});
