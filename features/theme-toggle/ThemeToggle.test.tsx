import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from './index';
import feature from './index';

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

  it('aria-label reflects the current mode after toggle', async () => {
    await act(async () => {
      render(<ThemeToggle />);
    });
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('restores saved dark preference from localStorage on mount', async () => {
    localStorage.setItem('theme', 'dark');
    await act(async () => {
      render(<ThemeToggle />);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('shows the sun icon in light mode and moon icon in dark mode', async () => {
    await act(async () => {
      render(<ThemeToggle />);
    });
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('☀');

    await act(async () => {
      fireEvent.click(button);
    });
    expect(button.textContent).toContain('🌙');
  });

  it('defaults to light mode when no preference is saved', async () => {
    await act(async () => {
      render(<ThemeToggle />);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

describe('ThemeToggle feature descriptor', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('theme-toggle');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(10);
  });

  it('exposes the ThemeToggle component', () => {
    expect(feature.Component).toBe(ThemeToggle);
  });
});
