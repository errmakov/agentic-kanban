import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AgendaList } from './index';

describe('AgendaList', () => {
  it('renders the heading', () => {
    render(<AgendaList />);
    expect(screen.getByRole('heading', { name: /today's agenda/i })).toBeInTheDocument();
  });

  it('renders session times and titles', () => {
    render(<AgendaList />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('Welcome & Intro')).toBeInTheDocument();
  });
});
