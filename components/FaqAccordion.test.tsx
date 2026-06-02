import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaqAccordion } from './FaqAccordion';

describe('FaqAccordion', () => {
  it('renders the FAQ heading', () => {
    render(<FaqAccordion />);
    expect(
      screen.getByRole('heading', { name: /frequently asked questions/i }),
    ).toBeInTheDocument();
  });

  it('renders each question', () => {
    render(<FaqAccordion />);
    expect(screen.getByText(/what is factorywall\?/i)).toBeInTheDocument();
    expect(screen.getByText(/how are features built\?/i)).toBeInTheDocument();
    expect(screen.getByText(/what is the kanban pipeline\?/i)).toBeInTheDocument();
    expect(screen.getByText(/can i interact with the app\?/i)).toBeInTheDocument();
  });

  it('renders the answer text in the DOM', () => {
    render(<FaqAccordion />);
    expect(
      screen.getByText(/a web app built on stage during the workshop/i),
    ).toBeInTheDocument();
  });
});
