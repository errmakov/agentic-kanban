import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './index';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 7 }) }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a placeholder before the first fetch resolves', async () => {
    render(<AttendeeCounter />);
    expect(screen.getByText(/— watching/)).toBeInTheDocument();
    // flush the pending heartbeat update so it doesn't leak into the next test
    await waitFor(() => expect(screen.getByText(/7 watching/)).toBeInTheDocument());
  });

  it('renders the live count once the fetch resolves', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/7 watching/)).toBeInTheDocument();
    });
  });
});
