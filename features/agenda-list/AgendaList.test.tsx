import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import feature from './index';

const AgendaList = feature.Component;

describe('AgendaList', () => {
  it('renders the agenda heading', () => {
    render(<AgendaList />);
    expect(
      screen.getByRole('heading', { name: /today's agenda/i }),
    ).toBeInTheDocument();
  });

  it('renders at least one agenda item with a time', () => {
    render(<AgendaList />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText(/welcome & intro/i)).toBeInTheDocument();
  });
});
