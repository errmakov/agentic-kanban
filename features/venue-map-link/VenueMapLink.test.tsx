import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import feature from './index';

const VenueMapLink = feature.Component;

describe('VenueMapLink', () => {
  it('renders a link labelled "Venue map"', () => {
    render(<VenueMapLink />);
    expect(
      screen.getByRole('link', { name: /venue map/i }),
    ).toBeInTheDocument();
  });

  it('points at the venue location on Google Maps', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: /venue map/i })).toHaveAttribute(
      'href',
      'https://maps.google.com/?q=conference+venue',
    );
  });

  it('opens in a new tab with safe rel attributes', () => {
    render(<VenueMapLink />);
    const link = screen.getByRole('link', { name: /venue map/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('venue-map-link feature descriptor', () => {
  it('exports correct feature descriptor properties', () => {
    expect(feature.id).toBe('venue-map-link');
    expect(feature.slot).toBe('footer');
    expect(feature.order).toBe(10);
  });
});
