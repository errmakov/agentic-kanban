import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const { Component: AttendeeCounter } = feature;

describe('AttendeeCounter', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => ({ count: 3 }) })) as unknown as typeof fetch,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a watching label', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => expect(screen.getByText(/watching/i)).toBeInTheDocument());
  });

  it('sends a heartbeat (POST) on mount', async () => {
    render(<AttendeeCounter />);
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/attendee-counter',
        expect.objectContaining({ method: 'POST' }),
      ),
    );
  });

  it('polls the count (GET) on mount', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/attendee-counter'));
  });
});
