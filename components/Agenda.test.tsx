import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './Agenda';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders an agenda item with a time and session', () => {
    render(<Agenda />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(
      screen.getByText(/keynote: building live with agents/i),
    ).toBeInTheDocument();
  });

  it('renders at least 3 agenda items', () => {
    render(<Agenda />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('renders all 6 default agenda items', () => {
    render(<Agenda />);
    expect(screen.getByText('08:30')).toBeInTheDocument();
    expect(screen.getByText(/registration/i)).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
    expect(screen.getByText(/break/i)).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
    expect(screen.getByText(/hands-on workshop/i)).toBeInTheDocument();
    expect(screen.getByText('12:30')).toBeInTheDocument();
    expect(screen.getByText(/lunch/i)).toBeInTheDocument();
    expect(screen.getByText('13:30')).toBeInTheDocument();
    expect(screen.getByText(/q&a and wrap-up/i)).toBeInTheDocument();
  });

  it('renders items inside an ordered list', () => {
    render(<Agenda />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    // ol has the implicit role "list" — verify it is ordered
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
  });

  it('renders inside a section with an accessible label', () => {
    const { container } = render(<Agenda />);
    const section = container.querySelector('section[aria-labelledby="agenda-heading"]');
    expect(section).toBeInTheDocument();
  });
});
