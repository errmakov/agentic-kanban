import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from './index';

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
});
