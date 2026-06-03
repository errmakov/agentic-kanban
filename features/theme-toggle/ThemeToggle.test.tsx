import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from './index';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders a toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('persists the chosen theme to localStorage on click', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('toggles the dark class on the document element', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
