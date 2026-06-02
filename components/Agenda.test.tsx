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

  it('renders a session item', () => {
    render(<Agenda />);
    expect(
      screen.getByText(/intro to agentic pipelines/i),
    ).toBeInTheDocument();
  });

  it('renders at least 5 session items', () => {
    render(<Agenda />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(5);
  });

  it('renders every session with a time in HH:MM format', () => {
    render(<Agenda />);
    const items = screen.getAllByRole('listitem');
    for (const item of items) {
      expect(item.textContent).toMatch(/\d{2}:\d{2}/);
    }
  });

  it('renders each session as two separate spans (time and title)', () => {
    render(<Agenda />);
    const items = screen.getAllByRole('listitem');
    for (const item of items) {
      const spans = item.querySelectorAll('span');
      expect(spans).toHaveLength(2);
      expect(spans[0].textContent).toMatch(/\d{2}:\d{2}/);
      expect(spans[1].textContent!.length).toBeGreaterThan(0);
    }
  });

  it('exposes the section as an accessible region', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('region', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });
});
