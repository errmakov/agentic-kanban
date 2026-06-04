import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DayAgenda } from './index';

describe('DayAgenda', () => {
  it('renders the agenda heading', () => {
    render(<DayAgenda />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders at least one agenda entry', () => {
    render(<DayAgenda />);
    expect(screen.getByText(/welcome & setup/i)).toBeInTheDocument();
  });
});
