import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false }),
    );
  });

  it('renders with the light-theme aria-label by default', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to dark theme/i }),
    ).toBeInTheDocument();
  });

  it('renders with the dark-theme aria-label when dark class is already set', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to light theme/i }),
    ).toBeInTheDocument();
  });

  it('toggles the dark class on the document element when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('updates aria-label to reflect the next action after toggling to dark', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
  });

  it('updates aria-label back to switch-to-dark after toggling back to light', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
  });

  it('renders moon icon in light mode and sun icon in dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('☽');

    fireEvent.click(button);
    expect(button).toHaveTextContent('☀');
  });

  it('persists the chosen theme to localStorage', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('writes "light" back to localStorage when toggling from dark to light', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
