import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './index';
import feature from './index';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /agenda/i }),
    ).toBeInTheDocument();
  });

  it('lists session items with times', () => {
    render(<Agenda />);
    expect(screen.getByText('Opening Keynote')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });

  it('renders all 6 session items', () => {
    render(<Agenda />);
    expect(screen.getByText('Opening Keynote')).toBeInTheDocument();
    expect(screen.getByText('Building Features Live')).toBeInTheDocument();
    expect(screen.getByText('Coffee Break')).toBeInTheDocument();
    expect(screen.getByText('Agent Pipelines in Practice')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Closing Q&A')).toBeInTheDocument();
  });

  it('renders each session time as a <time> element', () => {
    render(<Agenda />);
    const timeElements = document.querySelectorAll('time');
    expect(timeElements.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('09:00').tagName).toBe('TIME');
  });

  it('renders a <ul> list of <li> items', () => {
    render(<Agenda />);
    const list = document.querySelector('ul');
    expect(list).not.toBeNull();
    const items = list!.querySelectorAll('li');
    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it('renders inside a <section> with aria-labelledby', () => {
    render(<Agenda />);
    const section = document.querySelector('section[aria-labelledby]');
    expect(section).not.toBeNull();
  });
});

describe('Agenda feature descriptor', () => {
  it('has id "agenda"', () => {
    expect(feature.id).toBe('agenda');
  });

  it('targets the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });

  it('exposes the Agenda component', () => {
    expect(feature.Component).toBe(Agenda);
  });
});
