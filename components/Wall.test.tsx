import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Wall } from './Wall';

describe('Wall', () => {
  it('renders the welcome heading', () => {
    render(<Wall />);
    expect(
      screen.getByRole('heading', { name: /welcome to the workshop/i }),
    ).toBeInTheDocument();
  });

  it('renders the agenda list inside the wall', () => {
    render(<Wall />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });
});
