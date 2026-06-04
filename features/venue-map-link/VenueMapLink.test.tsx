import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VenueMapLink } from './index';
import feature from './index';

describe('VenueMapLink', () => {
  it('renders a link labelled "Venue map"', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toBeInTheDocument();
  });

  it('points at the venue location on Google Maps', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toHaveAttribute(
      'href',
      'https://maps.google.com/?q=conference+venue',
    );
  });

  it('opens in a new tab safely', () => {
    render(<VenueMapLink />);
    const link = screen.getByRole('link', { name: 'Venue map' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has the correct feature descriptor', () => {
    expect(feature.id).toBe('venue-map-link');
    expect(feature.slot).toBe('footer');
    expect(typeof feature.Component).toBe('function');
  });
});
