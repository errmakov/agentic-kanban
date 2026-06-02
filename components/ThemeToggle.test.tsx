import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('renders a button with an accessible label', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /toggle dark mode/i }),
    ).toBeInTheDocument();
  });

  it('toggles the dark class and persists the choice', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('starts in dark mode and toggles back to light when dark class is pre-set', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('displays the moon icon in light mode and sun icon in dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle dark mode/i });

    expect(button).toHaveTextContent('🌙');

    fireEvent.click(button);
    expect(button).toHaveTextContent('☀️');
  });

  it('persists theme key as "theme" in localStorage', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /toggle dark mode/i }));
    expect(Object.keys(localStorage)).toContain('theme');
  });
});
