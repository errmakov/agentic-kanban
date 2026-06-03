import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './index';
import feature from './index';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /today.s agenda/i }),
    ).toBeInTheDocument();
  });

  it('lists at least one session with a title', () => {
    render(<Agenda />);
    expect(screen.getByText(/welcome and intro to factorywall/i)).toBeInTheDocument();
  });

  it('renders all session times', () => {
    render(<Agenda />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
    expect(screen.getByText('12:30')).toBeInTheDocument();
    expect(screen.getByText('13:30')).toBeInTheDocument();
    expect(screen.getByText('15:30')).toBeInTheDocument();
  });

  it('renders all session titles', () => {
    render(<Agenda />);
    expect(screen.getByText(/doors open & coffee/i)).toBeInTheDocument();
    expect(screen.getByText(/building features live on stage/i)).toBeInTheDocument();
    expect(screen.getByText(/lunch break/i)).toBeInTheDocument();
    expect(screen.getByText(/the agent pipeline, end to end/i)).toBeInTheDocument();
    expect(screen.getByText(/q&a and wrap-up/i)).toBeInTheDocument();
  });

  it('renders sessions inside a list', () => {
    render(<Agenda />);
    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');
    expect(list).toBeInTheDocument();
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('wraps content in a section with accessible label', () => {
    render(<Agenda />);
    const section = screen.getByRole('region', { name: /today.s agenda/i });
    expect(section).toBeInTheDocument();
  });
});

describe('Agenda feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('agenda');
  });

  it('renders into the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has a low order value to appear near the top', () => {
    expect(feature.order).toBe(10);
  });

  it('exposes the Agenda component', () => {
    expect(feature.Component).toBe(Agenda);
  });
});
