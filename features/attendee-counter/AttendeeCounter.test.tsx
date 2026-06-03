import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import feature from './index';

const { Component: AttendeeCounter } = feature;

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ json: () => Promise.resolve({ count: 0 }) }),
      ),
    );
  });

  it('renders the watching label with a count', () => {
    render(<AttendeeCounter />);
    expect(screen.getByText(/watching/i)).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});
