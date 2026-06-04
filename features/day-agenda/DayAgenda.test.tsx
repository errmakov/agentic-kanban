import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DayAgenda } from './index';

describe('DayAgenda', () => {
  it('renders the heading', () => {
    render(<DayAgenda />);
    expect(screen.getByRole('heading', { name: /today's agenda/i })).toBeInTheDocument();
  });

  it('renders at least one agenda item', () => {
    render(<DayAgenda />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});
