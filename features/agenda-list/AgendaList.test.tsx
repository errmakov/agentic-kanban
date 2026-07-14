import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import feature from './index';

const AgendaList = feature.Component;

describe('Feature descriptor', () => {
  it('has the correct id and slot', () => {
    expect(feature.id).toBe('agenda-list');
    expect(feature.slot).toBe('main');
  });

  it('exposes AgendaList as its Component', () => {
    expect(typeof feature.Component).toBe('function');
  });
});

describe('AgendaList', () => {
  it('renders the agenda heading', () => {
    render(<AgendaList />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders at least three agenda items', () => {
    render(<AgendaList />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('renders each item with a time and a title', () => {
    render(<AgendaList />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText(/doors open/i)).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText(/lunch/i)).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText(/wrap-up/i)).toBeInTheDocument();
  });

  it('uses an ordered list for semantic HTML', () => {
    const { container } = render(<AgendaList />);
    expect(container.querySelector('ol')).not.toBeNull();
    expect(container.querySelectorAll('li').length).toBeGreaterThanOrEqual(3);
  });

  it('labels the section for accessibility via aria-labelledby', () => {
    const { container } = render(<AgendaList />);
    const section = container.querySelector('section');
    expect(section).not.toBeNull();
    expect(section!.getAttribute('aria-labelledby')).toBe('agenda-heading');
    expect(container.querySelector('#agenda-heading')).not.toBeNull();
  });

  it('renders time and title in separate elements', () => {
    render(<AgendaList />);
    // Both the time and title for the first item should be individually queryable
    const timeEl = screen.getByText('09:00');
    const titleEl = screen.getByText(/doors open/i);
    expect(timeEl).not.toBe(titleEl);
  });
});
