import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './Agenda';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders an agenda item with a time and title', () => {
    render(<Agenda />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText(/doors open & coffee/i)).toBeInTheDocument();
  });

  it('renders all agenda items', () => {
    render(<Agenda />);
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText(/keynote/i)).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
    expect(screen.getByText(/your first agent-shipped feature/i)).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText(/lunch break/i)).toBeInTheDocument();
    expect(screen.getByText('13:00')).toBeInTheDocument();
    expect(screen.getByText(/scaling the kanban pull system/i)).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByText(/wrap-up & open q&a/i)).toBeInTheDocument();
  });

  it('renders items as a list', () => {
    render(<Agenda />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
  });

  it('section is labelled by the heading for accessibility', () => {
    render(<Agenda />);
    const heading = screen.getByRole('heading', { name: /agenda/i });
    expect(heading.id).toBe('agenda-heading');
    const section = heading.closest('section');
    expect(section).toHaveAttribute('aria-labelledby', 'agenda-heading');
  });
});
