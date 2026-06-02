import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
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
});
