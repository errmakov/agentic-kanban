import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('always renders the static footer text', () => {
    vi.stubEnv('NEXT_PUBLIC_VENUE_MAP_URL', '');
    render(<Footer />);
    expect(screen.getByText(/FactoryWall/)).toBeInTheDocument();
  });

  it('renders a venue map link when NEXT_PUBLIC_VENUE_MAP_URL is set', () => {
    vi.stubEnv('NEXT_PUBLIC_VENUE_MAP_URL', 'https://maps.example.com/venue');
    render(<Footer />);
    const link = screen.getByRole('link', { name: /venue map/i });
    expect(link).toHaveAttribute('href', 'https://maps.example.com/venue');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders no venue map link when NEXT_PUBLIC_VENUE_MAP_URL is empty string', () => {
    vi.stubEnv('NEXT_PUBLIC_VENUE_MAP_URL', '');
    render(<Footer />);
    expect(screen.queryByRole('link', { name: /venue map/i })).not.toBeInTheDocument();
  });

  it('renders no venue map link when NEXT_PUBLIC_VENUE_MAP_URL is undefined', () => {
    vi.stubEnv('NEXT_PUBLIC_VENUE_MAP_URL', undefined as unknown as string);
    render(<Footer />);
    expect(screen.queryByRole('link', { name: /venue map/i })).not.toBeInTheDocument();
  });
});
