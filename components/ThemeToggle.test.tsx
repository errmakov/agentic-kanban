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
});
