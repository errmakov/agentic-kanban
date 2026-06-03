import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VenueMapLink } from './index';
import feature from './index';

describe('VenueMapLink', () => {
  it('renders a link with visible text "Venue map"', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link', { name: 'Venue map' })).toBeInTheDocument();
  });

  it('has the correct href', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://maps.google.com/?q=conference+venue',
    );
  });

  it('opens in a new tab', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });

  it('has rel="noopener noreferrer"', () => {
    render(<VenueMapLink />);
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('VenueMapLink feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('venue-map-link');
  });

  it('is registered in the footer slot', () => {
    expect(feature.slot).toBe('footer');
  });

  it('has order 100', () => {
    expect(feature.order).toBe(100);
  });

  it('has VenueMapLink as its Component', () => {
    expect(feature.Component).toBe(VenueMapLink);
  });
});
