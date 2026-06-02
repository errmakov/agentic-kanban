import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgendaList } from './AgendaList';

describe('AgendaList', () => {
  it('renders the agenda heading', () => {
    render(<AgendaList />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders an agenda item', () => {
    render(<AgendaList />);
    expect(
      screen.getByText(/keynote: building software live with agents/i),
    ).toBeInTheDocument();
  });

  it('renders at least 3 agenda items', () => {
    render(<AgendaList />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('renders a time alongside each session title', () => {
    render(<AgendaList />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText(/doors open/i)).toBeInTheDocument();
  });

  it('section is labelled by the heading for accessibility', () => {
    render(<AgendaList />);
    const heading = screen.getByRole('heading', { name: /today's agenda/i });
    const section = heading.closest('section');
    expect(section).toHaveAttribute('aria-labelledby', heading.id);
  });
});
