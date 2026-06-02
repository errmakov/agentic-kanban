import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeContext } from '@/app/theme-context';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('renders an accessible toggle labelled for the next action', () => {
    render(
      <ThemeContext.Provider value={{ theme: 'light', toggle: () => {} }}>
        <ThemeToggle />
      </ThemeContext.Provider>,
    );
    expect(
      screen.getByRole('button', { name: /switch to dark theme/i }),
    ).toBeInTheDocument();
  });

  it('calls toggle when clicked', () => {
    const toggle = vi.fn();
    render(
      <ThemeContext.Provider value={{ theme: 'dark', toggle }}>
        <ThemeToggle />
      </ThemeContext.Provider>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /switch to light theme/i }),
    );
    expect(toggle).toHaveBeenCalledOnce();
  });
});
