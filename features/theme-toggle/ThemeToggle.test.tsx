import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from './index';

beforeEach(() => {
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

describe('ThemeToggle', () => {
  it('renders a toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has an accessible label for switching to dark mode by default', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('toggles the dark class on documentElement when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('updates accessible label after toggling to dark', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('initializes as dark when documentElement already has dark class', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('shows moon icon in light mode and sun icon in dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('🌙');
    fireEvent.click(button);
    expect(button.textContent).toBe('☀️');
  });

  it('persists dark preference to localStorage on toggle', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('persists light preference to localStorage when toggling back', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
