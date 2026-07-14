import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from './index';

describe('FaqAccordion', () => {
  it('renders the FAQ heading', () => {
    render(<FaqAccordion />);
    expect(screen.getByRole('heading', { name: /faq/i })).toBeInTheDocument();
  });

  it('renders all questions', () => {
    render(<FaqAccordion />);
    expect(screen.getByRole('button', { name: /what is factorywall/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /how is this page built/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /can i interact with it/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /what is it made with/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /how do agents build in parallel/i })).toBeInTheDocument();
  });

  it('has aria-expanded false on all questions initially', () => {
    render(<FaqAccordion />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('hides answers until a question is clicked', () => {
    render(<FaqAccordion />);

    const question = screen.getByRole('button', { name: /what is factorywall/i });
    const answer = screen.getByText(/live session-companion web app/i);

    expect(answer).not.toBeVisible();
    expect(question).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(question);

    expect(answer).toBeVisible();
    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(question).toHaveAttribute('aria-controls', 'faq-what');
  });

  it('collapses the answer when the same question is clicked again', () => {
    render(<FaqAccordion />);

    const question = screen.getByRole('button', { name: /what is factorywall/i });
    const answer = screen.getByText(/live session-companion web app/i);

    fireEvent.click(question);
    expect(answer).toBeVisible();

    fireEvent.click(question);
    expect(answer).not.toBeVisible();
    expect(question).toHaveAttribute('aria-expanded', 'false');
  });

  it('opening a second question collapses the first', () => {
    render(<FaqAccordion />);

    const first = screen.getByRole('button', { name: /what is factorywall/i });
    const second = screen.getByRole('button', { name: /how is this page built/i });
    const firstAnswer = screen.getByText(/live session-companion web app/i);
    const secondAnswer = screen.getByText(/feature-by-feature, live on stage/i);

    fireEvent.click(first);
    expect(firstAnswer).toBeVisible();

    fireEvent.click(second);
    expect(secondAnswer).toBeVisible();
    expect(firstAnswer).not.toBeVisible();
  });
});
