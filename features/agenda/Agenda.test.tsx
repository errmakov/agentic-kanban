import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Agenda } from './index';

describe('Agenda', () => {
  it('renders the agenda heading', () => {
    render(<Agenda />);
    expect(
      screen.getByRole('heading', { name: /agenda/i }),
    ).toBeInTheDocument();
  });

  it('lists session items with times', () => {
    render(<Agenda />);
    expect(screen.getByText('Opening Keynote')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });
});
