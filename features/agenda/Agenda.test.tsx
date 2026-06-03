import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './index';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /today.s agenda/i }),
    ).toBeInTheDocument();
  });

  it('lists at least one session with a title', () => {
    render(<Agenda />);
    expect(screen.getByText(/welcome and intro to factorywall/i)).toBeInTheDocument();
  });
});
