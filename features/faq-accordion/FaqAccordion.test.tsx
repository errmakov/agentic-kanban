import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import feature from './index';

const FaqAccordion = feature.Component;

describe('FaqAccordion', () => {
  it('renders all questions', () => {
    render(<FaqAccordion />);
    expect(screen.getByText('What is FactoryWall?')).toBeInTheDocument();
    expect(screen.getByText('How do I send a reaction?')).toBeInTheDocument();
    expect(screen.getByText('Will my reactions be saved?')).toBeInTheDocument();
    expect(screen.getByText('Do I need an account?')).toBeInTheDocument();
    expect(screen.getByText('Can I change the theme?')).toBeInTheDocument();
  });

  it('hides all answers by default', () => {
    render(<FaqAccordion />);
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('reveals the answer when a question is clicked', () => {
    render(<FaqAccordion />);
    const button = screen.getByRole('button', { name: /What is FactoryWall\?/i });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText(/live session companion/i),
    ).toBeInTheDocument();
  });

  it('collapses the answer when the open question is clicked again', () => {
    render(<FaqAccordion />);
    const button = screen.getByRole('button', { name: /What is FactoryWall\?/i });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the previous answer when a different question is opened', () => {
    render(<FaqAccordion />);
    const first = screen.getByRole('button', { name: /What is FactoryWall\?/i });
    const second = screen.getByRole('button', { name: /How do I send a reaction\?/i });

    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  it('answer panels have role="region" and are linked to their buttons', () => {
    render(<FaqAccordion />);
    const panels = screen
      .getAllByRole('region')
      .filter((el) => el.id.startsWith('faq-panel-'));
    expect(panels.length).toBe(5);
    panels.forEach((panel, i) => {
      expect(panel).toHaveAttribute('id', `faq-panel-${i}`);
      expect(panel).toHaveAttribute('aria-labelledby', `faq-btn-${i}`);
    });
  });
});

describe('feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('faq-accordion');
  });

  it('renders into the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 200', () => {
    expect(feature.order).toBe(200);
  });
});
