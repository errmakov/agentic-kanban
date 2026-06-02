import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders the FactoryWall heading', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { name: /factorywall/i })).toBeInTheDocument();
  });

  it('renders the ThemeToggle button', () => {
    render(<Header />);
    expect(
      screen.getByRole('button', { name: /toggle dark mode/i }),
    ).toBeInTheDocument();
  });

  it('renders the ShareButton', () => {
    render(<Header />);
    expect(
      screen.getByRole('button', { name: /copy session link/i }),
    ).toBeInTheDocument();
  });
});
