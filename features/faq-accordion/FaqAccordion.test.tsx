import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from './index';
import feature from './index';

describe('FaqAccordion', () => {
  it('renders all question buttons', () => {
    render(<FaqAccordion />);
    expect(screen.getByText('What is FactoryWall?')).toBeInTheDocument();
    expect(screen.getByText('How do I react to something?')).toBeInTheDocument();
    expect(screen.getByText('Is my data saved?')).toBeInTheDocument();
    expect(screen.getByText('Who builds these features?')).toBeInTheDocument();
    expect(screen.getByText('Can I use this for my own events?')).toBeInTheDocument();
  });

  it('renders the FAQ section heading', () => {
    render(<FaqAccordion />);
    expect(screen.getByRole('heading', { name: 'FAQ' })).toBeInTheDocument();
  });

  it('hides answers initially', () => {
    render(<FaqAccordion />);
    const regions = screen.getAllByRole('region');
    for (const region of regions) {
      expect(region.className).toContain('opacity-0');
    }
  });

  it('shows answer after clicking a question', () => {
    render(<FaqAccordion />);
    fireEvent.click(screen.getByText('What is FactoryWall?'));
    const region = screen.getByRole('region', { name: 'What is FactoryWall?' });
    expect(region.className).toContain('opacity-100');
  });

  it('hides answer after clicking the same question again', () => {
    render(<FaqAccordion />);
    const btn = screen.getByText('What is FactoryWall?');
    fireEvent.click(btn);
    fireEvent.click(btn);
    const region = screen.getByRole('region', { name: 'What is FactoryWall?' });
    expect(region.className).toContain('opacity-0');
  });

  it('closes the first question when a second is opened', () => {
    render(<FaqAccordion />);
    fireEvent.click(screen.getByText('What is FactoryWall?'));
    fireEvent.click(screen.getByText('Is my data saved?'));
    expect(
      screen.getByRole('region', { name: 'What is FactoryWall?' }).className,
    ).toContain('opacity-0');
    expect(
      screen.getByRole('region', { name: 'Is my data saved?' }).className,
    ).toContain('opacity-100');
  });

  it('question triggers are button elements', () => {
    render(<FaqAccordion />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('sets aria-expanded=false on buttons initially', () => {
    render(<FaqAccordion />);
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('sets aria-expanded=true after opening a question', () => {
    render(<FaqAccordion />);
    const btn = screen.getAllByRole('button')[0];
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded=false after closing a question', () => {
    render(<FaqAccordion />);
    const btn = screen.getAllByRole('button')[0];
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders answer text content when a question is opened', () => {
    render(<FaqAccordion />);
    fireEvent.click(screen.getByText('What is FactoryWall?'));
    expect(screen.getByText(/live session companion/i)).toBeInTheDocument();
  });
});

describe('faq-accordion feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('faq-accordion');
  });

  it('renders into the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 200', () => {
    expect(feature.order).toBe(200);
  });

  it('exports FaqAccordion as Component', () => {
    expect(feature.Component).toBe(FaqAccordion);
  });
});
