import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendeeCounter } from './index';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ count: 3 }),
    })
  ));
});

describe('AttendeeCounter', () => {
  it('renders the watching count', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/watching/i)).toBeInTheDocument();
    });
  });
});
