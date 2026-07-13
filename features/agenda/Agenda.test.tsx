import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './index';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('lists sessions with times', () => {
    render(<Agenda />);
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(
      screen.getByText(/keynote: building live with agents/i),
    ).toBeInTheDocument();
  });
});
