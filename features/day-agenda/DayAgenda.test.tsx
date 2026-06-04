import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DayAgenda } from './index';

describe('DayAgenda', () => {
  it('renders the agenda heading', () => {
    render(<DayAgenda />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders at least 4 agenda entries', () => {
    render(<DayAgenda />);
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it('renders all 6 agenda entries', () => {
    render(<DayAgenda />);
    expect(screen.getByText(/welcome & setup/i)).toBeInTheDocument();
    expect(screen.getByText(/building features live with agents/i)).toBeInTheDocument();
    expect(screen.getByText(/the kanban pull system/i)).toBeInTheDocument();
    expect(screen.getByText(/lunch break/i)).toBeInTheDocument();
    expect(screen.getByText(/scaling the agent pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/q&a and wrap-up/i)).toBeInTheDocument();
  });

  it('renders each entry with a time and a title', () => {
    render(<DayAgenda />);
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    items.forEach((item) => {
      expect(item.textContent).toMatch(/\d{2}:\d{2}/);
      expect(item.textContent!.length).toBeGreaterThan(5);
    });
  });

  it('uses an ordered list for chronological order', () => {
    render(<DayAgenda />);
    expect(screen.getByRole('list').tagName).toBe('OL');
  });

  it('renders entries in time-ascending order', () => {
    render(<DayAgenda />);
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    const times = items.map((item) => item.textContent!.match(/\d{2}:\d{2}/)![0]);
    const sorted = [...times].sort();
    expect(times).toEqual(sorted);
  });

  it('renders the section with an accessible label', () => {
    render(<DayAgenda />);
    expect(screen.getByRole('region', { name: /today's agenda/i })).toBeInTheDocument();
  });
});
