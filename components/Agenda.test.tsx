import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './Agenda';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders a session item', () => {
    render(<Agenda />);
    expect(
      screen.getByText(/intro to agentic pipelines/i),
    ).toBeInTheDocument();
  });
});
