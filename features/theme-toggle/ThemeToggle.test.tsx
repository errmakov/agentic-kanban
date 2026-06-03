import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggle } from './index';
import feature from './index';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders with the "switch to dark theme" label by default', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to dark theme/i }),
    ).toBeInTheDocument();
  });

  it('toggles the theme, the label, and persists the choice', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /switch to dark theme/i });

    fireEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(
      screen.getByRole('button', { name: /switch to light theme/i }),
    ).toBeInTheDocument();

    fireEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('renders in dark mode when <html> already has the dark class (OS preference)', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to light theme/i }),
    ).toBeInTheDocument();
  });

  it('shows moon icon in light mode and sun icon in dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('☽');

    fireEvent.click(button);
    expect(button.textContent).toContain('☀');
  });

  it('still toggles the dark class when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(
      screen.getByRole('button', { name: /switch to light theme/i }),
    ).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});

describe('theme-toggle feature descriptor', () => {
  it('registers in the header slot with id theme-toggle and order 10', () => {
    expect(feature.id).toBe('theme-toggle');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(10);
    expect(feature.Component).toBe(ThemeToggle);
  });
});
