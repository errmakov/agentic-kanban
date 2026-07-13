import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import feature from './index';

const VenueMapLink = feature.Component;

describe('VenueMapLink', () => {
  it('renders a link with the text "Venue map"', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toBeInTheDocument();
  });

  it('points to the venue location on Google Maps', () => {
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

  it('registers in the footer slot with order 10', () => {
    expect(feature.id).toBe('venue-map-link');
    expect(feature.slot).toBe('footer');
    expect(feature.order).toBe(10);
  });

  it('renders unconditionally without any env vars or props', () => {
    // No env vars, no props — link must always be present
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toBeInTheDocument();
  });
});
