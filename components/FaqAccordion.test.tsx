import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders all four answers in the DOM', () => {
    render(<FaqAccordion />);
    expect(screen.getByText(/a web app built on stage during the workshop/i)).toBeInTheDocument();
    expect(screen.getByText(/every github issue becomes one small feature/i)).toBeInTheDocument();
    expect(screen.getByText(/pull-based kanban board/i)).toBeInTheDocument();
    expect(screen.getByText(/many features let the audience join in/i)).toBeInTheDocument();
  });

  it('all details elements are collapsed by default', () => {
    const { container } = render(<FaqAccordion />);
    const allDetails = container.querySelectorAll('details');
    expect(allDetails).toHaveLength(4);
    allDetails.forEach((detail) => {
      expect(detail).not.toHaveAttribute('open');
    });
  });

  it('clicking a summary expands its details element', () => {
    render(<FaqAccordion />);
    const summary = screen.getByText(/what is factorywall\?/i);
    const detailsEl = summary.closest('details')!;
    fireEvent.click(summary);
    expect(detailsEl).toHaveAttribute('open');
  });

  it('clicking an open summary collapses the details element', () => {
    render(<FaqAccordion />);
    const summary = screen.getByText(/what is factorywall\?/i);
    const detailsEl = summary.closest('details')!;
    fireEvent.click(summary);
    expect(detailsEl).toHaveAttribute('open');
    fireEvent.click(summary);
    expect(detailsEl).not.toHaveAttribute('open');
  });

  it('multiple items can be open at the same time', () => {
    const { container } = render(<FaqAccordion />);
    fireEvent.click(screen.getByText(/what is factorywall\?/i));
    fireEvent.click(screen.getByText(/how are features built\?/i));
    const allDetails = container.querySelectorAll('details');
    expect(allDetails[0]).toHaveAttribute('open');
    expect(allDetails[1]).toHaveAttribute('open');
    expect(allDetails[2]).not.toHaveAttribute('open');
    expect(allDetails[3]).not.toHaveAttribute('open');
  });

  it('wraps items in a section with an accessible label', () => {
    render(<FaqAccordion />);
    expect(
      screen.getByRole('region', { name: /frequently asked questions/i }),
    ).toBeInTheDocument();
  });
});
