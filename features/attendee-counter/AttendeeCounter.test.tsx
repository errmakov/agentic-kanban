import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const AttendeeCounter = feature.Component;

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders a placeholder before the first fetch resolves', () => {
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    render(<AttendeeCounter />);
    expect(screen.getByText(/—\s*watching/)).toBeInTheDocument();
  });

  it('renders the count returned by the heartbeat', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => ({ count: 7 }),
    });
    render(<AttendeeCounter />);
    await waitFor(() => expect(screen.getByText(/7\s*watching/)).toBeInTheDocument());
  });

  it('registers in the header slot with order 10', () => {
    expect(feature.id).toBe('attendee-counter');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(10);
  });

  it('keeps the placeholder when fetch rejects', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network Error'));
    render(<AttendeeCounter />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByText(/—\s*watching/)).toBeInTheDocument();
  });

  it('POSTs to /api/attendee-counter with a JSON body', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: async () => ({ count: 3 }),
    });
    render(<AttendeeCounter />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      '/api/attendee-counter',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });
});
