import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from './index';
import feature from './index';

describe('FaqAccordion', () => {
  it('renders the FAQ heading', () => {
    render(<FaqAccordion />);
    expect(screen.getByRole('heading', { name: 'FAQ' })).toBeInTheDocument();
  });

  it('renders at least 4 question buttons', () => {
    render(<FaqAccordion />);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
  });

  it('renders the first question', () => {
    render(<FaqAccordion />);
    expect(screen.getByText('What is FactoryWall?')).toBeInTheDocument();
  });

  it('does not show any answer initially', () => {
    render(<FaqAccordion />);
    expect(screen.queryByText(/session-companion app/)).not.toBeInTheDocument();
  });

  it('shows the answer when the first question is clicked', () => {
    render(<FaqAccordion />);
    fireEvent.click(screen.getByText('What is FactoryWall?'));
    expect(screen.getByText(/session-companion app/)).toBeInTheDocument();
  });

  it('collapses the answer when the open question is clicked again', () => {
    render(<FaqAccordion />);
    fireEvent.click(screen.getByText('What is FactoryWall?'));
    expect(screen.getByText(/session-companion app/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('What is FactoryWall?'));
    expect(screen.queryByText(/session-companion app/)).not.toBeInTheDocument();
  });

  it('closes the first answer when a second question is opened', () => {
    render(<FaqAccordion />);
    fireEvent.click(screen.getByText('What is FactoryWall?'));
    expect(screen.getByText(/session-companion app/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('How do I react to a post?'));
    expect(screen.queryByText(/session-companion app/)).not.toBeInTheDocument();
    expect(screen.getByText(/emoji reaction bar/)).toBeInTheDocument();
  });

  it('sets aria-expanded="false" on all buttons initially', () => {
    render(<FaqAccordion />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toHaveAttribute('aria-expanded', 'false'));
  });

  it('sets aria-expanded="true" on the open button and false on others', () => {
    render(<FaqAccordion />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    buttons.slice(1).forEach((btn) => expect(btn).toHaveAttribute('aria-expanded', 'false'));
  });
});

describe('faq-accordion feature descriptor', () => {
  it('has id "faq-accordion"', () => {
    expect(feature.id).toBe('faq-accordion');
  });

  it('is registered in the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 50', () => {
    expect(feature.order).toBe(50);
  });

  it('exposes the FaqAccordion component', () => {
    expect(feature.Component).toBe(FaqAccordion);
  });
});
