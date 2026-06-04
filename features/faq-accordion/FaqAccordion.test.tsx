import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from './index';

describe('FaqAccordion', () => {
  it('shows all questions on initial render with no answers open', () => {
    render(<FaqAccordion />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('reveals an answer when its question is clicked', () => {
    render(<FaqAccordion />);
    const button = screen.getByRole('button', { name: /what is factorywall/i });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/live session-companion app/i)).toBeInTheDocument();
  });

  it('collapses an open answer when its question is clicked again', () => {
    render(<FaqAccordion />);
    const button = screen.getByRole('button', { name: /what is factorywall/i });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/live session-companion app/i)).not.toBeInTheDocument();
  });

  it('only keeps one answer open at a time', () => {
    render(<FaqAccordion />);
    const first = screen.getByRole('button', { name: /what is factorywall/i });
    const second = screen.getByRole('button', { name: /how do agents pick up work/i });
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });
});
