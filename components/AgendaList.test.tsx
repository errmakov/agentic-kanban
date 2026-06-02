import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgendaList } from './AgendaList';

describe('AgendaList', () => {
  it('renders the agenda heading', () => {
    render(<AgendaList />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders an agenda item', () => {
    render(<AgendaList />);
    expect(
      screen.getByText(/keynote: building software live with agents/i),
    ).toBeInTheDocument();
  });
});
