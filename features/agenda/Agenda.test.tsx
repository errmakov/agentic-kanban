import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './index';
import feature from './index';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('lists sessions with times', () => {
    render(<Agenda />);
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(
      screen.getByText(/keynote: building live with agents/i),
    ).toBeInTheDocument();
  });

  it('renders at least 3 agenda items', () => {
    render(<Agenda />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('renders all 6 agenda items', () => {
    render(<Agenda />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });

  it('uses semantic list markup', () => {
    render(<Agenda />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);
  });

  it('shows a time for every agenda item', () => {
    render(<Agenda />);
    const times = ['09:00', '09:30', '10:30', '12:00', '13:00', '15:00'];
    for (const time of times) {
      expect(screen.getByText(time)).toBeInTheDocument();
    }
  });

  it('shows speaker names for items that have one', () => {
    render(<Agenda />);
    expect(screen.getByText(/anna petrov/i)).toBeInTheDocument();
    expect(screen.getByText(/dmitri sokolov/i)).toBeInTheDocument();
  });

  it('does not show a speaker for items without one', () => {
    render(<Agenda />);
    const lunchItem = screen.getByText('Lunch break').closest('li');
    expect(lunchItem).not.toBeNull();
    expect(lunchItem!.textContent).not.toContain('—');
  });

  it('section is accessible via aria-labelledby', () => {
    render(<Agenda />);
    const section = screen.getByRole('region', { name: /today's agenda/i });
    expect(section).toBeInTheDocument();
  });

  it('feature descriptor has correct id, slot, and order', () => {
    expect(feature.id).toBe('agenda');
    expect(feature.slot).toBe('main');
    expect(feature.order).toBe(10);
  });

  it('feature descriptor references the Agenda component', () => {
    expect(feature.Component).toBe(Agenda);
  });
});
