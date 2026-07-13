import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import feature from './index';

const FaqAccordion = feature.Component;

describe('FaqAccordion', () => {
  it('hides all answers on initial render', () => {
    render(<FaqAccordion />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('expands an answer when a collapsed question is clicked', () => {
    render(<FaqAccordion />);
    const [first] = screen.getAllByRole('button');
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses an already-open question when clicked again', () => {
    render(<FaqAccordion />);
    const [first] = screen.getAllByRole('button');
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  it('opening one question closes any previously open question', () => {
    render(<FaqAccordion />);
    const [first, second] = screen.getAllByRole('button');
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('feature descriptor', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('faq-accordion');
    expect(feature.slot).toBe('main');
    expect(feature.order).toBe(200);
  });
});
