import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from './index';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders the toggle button', async () => {
    await act(async () => {
      render(<ThemeToggle />);
    });
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('adds the dark class when toggled on and removes it when toggled off', async () => {
    await act(async () => {
      render(<ThemeToggle />);
    });
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
