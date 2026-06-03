import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const AttendeeCounter = feature.Component;

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 42 }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('renders the count returned by the API', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => expect(screen.getByText(/42 watching/)).toBeInTheDocument());
  });

  it('shows a placeholder before the first response', () => {
    render(<AttendeeCounter />);
    expect(screen.getByText(/– watching/)).toBeInTheDocument();
  });
});
