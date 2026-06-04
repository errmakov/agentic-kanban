import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from './index';
import feature from './index';

describe('FaqAccordion', () => {
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
});

describe('faq-accordion feature descriptor', () => {
  it('has id "faq-accordion"', () => {
    expect(feature.id).toBe('faq-accordion');
  });

  it('is registered in the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('exposes the FaqAccordion component', () => {
    expect(feature.Component).toBe(FaqAccordion);
  });
});
