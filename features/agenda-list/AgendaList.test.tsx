import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgendaList } from './index';
import feature from './index';

describe('AgendaList', () => {
  it('renders the heading', () => {
    render(<AgendaList />);
    expect(screen.getByRole('heading', { name: /today's agenda/i })).toBeInTheDocument();
  });

  it('renders all session times', () => {
    render(<AgendaList />);
    for (const time of ['09:00', '09:30', '10:30', '10:45', '11:30']) {
      expect(screen.getByText(time)).toBeInTheDocument();
    }
  });

  it('renders all session titles', () => {
    render(<AgendaList />);
    for (const title of [
      'Welcome & Intro',
      'Live Coding: Agentic Kanban',
      'Break',
      'Q&A / Demo',
      'Wrap-up',
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it('renders agenda items in an ordered list', () => {
    render(<AgendaList />);
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(5);
  });

  it('renders inside a landmark section', () => {
    const { container } = render(<AgendaList />);
    expect(container.querySelector('section')).not.toBeNull();
  });
});

describe('agenda-list feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('agenda-list');
  });

  it('targets the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });

  it('exposes AgendaList as the Component', () => {
    expect(feature.Component).toBe(AgendaList);
  });
});
