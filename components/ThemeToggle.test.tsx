import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

beforeEach(() => {
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('renders with "Switch to dark mode" label when no dark class is present', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('renders the moon icon (☽) in light mode', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button').textContent).toBe('☽');
  });

  it('clicking once activates dark mode and flips the label', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('renders the sun icon (☀) after switching to dark mode', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button').textContent).toBe('☀');
  });

  it('clicking twice returns to light mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists "dark" to localStorage when switching to dark', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('persists "light" to localStorage when switching back to light', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('initializes as dark when the html element already has the dark class', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('does not throw when localStorage is unavailable', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => { throw new Error('storage blocked'); });
    render(<ThemeToggle />);
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    Storage.prototype.setItem = originalSetItem;
  });
});
