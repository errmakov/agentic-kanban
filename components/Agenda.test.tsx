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

  it('renders an agenda item with a time and session', () => {
    render(<Agenda />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(
      screen.getByText(/keynote: building live with agents/i),
    ).toBeInTheDocument();
  });
});
