import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('renders a toggle button', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });

  it('toggles the dark class on the document element when clicked', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(
      await screen.findByRole('button', { name: /switch to light mode/i }),
    ).toBeInTheDocument();

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(
      await screen.findByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });

  it('shows "Switch to light mode" label when dark class is already active', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });

  it('displays moon icon in light mode and sun icon in dark mode', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('🌙');

    fireEvent.click(button);
    expect(await screen.findByRole('button')).toHaveTextContent('☀️');
  });

  it('still toggles when localStorage throws', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(
      await screen.findByRole('button', { name: /switch to light mode/i }),
    ).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it('clicking from dark mode removes dark class and saves light to localStorage', async () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(
      await screen.findByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });
});
