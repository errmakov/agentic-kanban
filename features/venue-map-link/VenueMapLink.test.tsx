import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VenueMapLink } from './index';
import feature from './index';

describe('VenueMapLink', () => {
  it('renders a link with accessible name "Venue map"', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toBeInTheDocument();
  });

  it('has the correct href', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toHaveAttribute(
      'href',
      'https://maps.google.com/?q=conference+venue'
    );
  });

  it('opens in a new tab', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toHaveAttribute('target', '_blank');
  });

  it('has rel="noopener noreferrer"', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });
});

describe('venue-map-link feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('venue-map-link');
  });

  it('targets the footer slot', () => {
    expect(feature.slot).toBe('footer');
  });

  it('uses VenueMapLink as the Component', () => {
    expect(feature.Component).toBe(VenueMapLink);
  });
});
