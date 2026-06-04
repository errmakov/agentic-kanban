import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendeeCounter } from './index';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => ({ count: 42 }),
    }),
  );
  vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });
});

describe('AttendeeCounter', () => {
  it('renders the count and "watching" label', async () => {
    render(<AttendeeCounter />);
    expect(await screen.findByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/watching/i)).toBeInTheDocument();
  });
});
