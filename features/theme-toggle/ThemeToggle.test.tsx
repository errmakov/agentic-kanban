import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from './index';
import feature from './index';

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

  it('shows moon icon in light mode', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('🌙');
  });

  it('shows sun icon after switching to dark mode', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('☀️');
  });

  it('saves "light" to localStorage when toggling back from dark', () => {
    document.documentElement.classList.add('dark');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('shows sun icon when starting in dark mode', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveTextContent('☀️');
  });

  it('has aria-label "Switch to dark theme" in light mode', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to dark theme',
    );
  });

  it('has aria-label "Switch to light theme" in dark mode', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to light theme',
    );
  });
});

describe('theme-toggle feature registration', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('theme-toggle');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(200);
  });
});
