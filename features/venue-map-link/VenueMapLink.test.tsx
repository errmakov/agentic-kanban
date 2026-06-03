import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import feature from './index';

const VenueMapLink = feature.Component;

describe('VenueMapLink', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_VENUE_MAP_URL;
  });

  it('renders a link with the correct href when env var is set', () => {
    process.env.NEXT_PUBLIC_VENUE_MAP_URL = 'https://example.com/map';
    render(<VenueMapLink />);
    const link = screen.getByRole('link', { name: /venue map/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/map');
  });

  it('opens in a new tab with noopener noreferrer', () => {
    process.env.NEXT_PUBLIC_VENUE_MAP_URL = 'https://example.com/map';
    render(<VenueMapLink />);
    const link = screen.getByRole('link', { name: /venue map/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders nothing when env var is not set', () => {
    render(<VenueMapLink />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders nothing when env var is an empty string', () => {
    process.env.NEXT_PUBLIC_VENUE_MAP_URL = '';
    render(<VenueMapLink />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('feature descriptor', () => {
  it('has the correct id and slot', () => {
    expect(feature.id).toBe('venue-map-link');
    expect(feature.slot).toBe('footer');
  });
});
