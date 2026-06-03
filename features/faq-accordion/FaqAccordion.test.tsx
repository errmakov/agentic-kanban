import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from './index';

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
});
