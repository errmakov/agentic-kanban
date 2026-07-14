import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import feature from './index';

const AttendeeCounter = feature.Component;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AttendeeCounter', () => {
  it('renders the count received from the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 7 }) }),
    );

    render(<AttendeeCounter />);

    await waitFor(() => {
      expect(screen.getByText(/7 watching/)).toBeInTheDocument();
    });
  });

  it('shows a placeholder before the first fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(<AttendeeCounter />);

    expect(screen.getByText(/— watching/)).toBeInTheDocument();
  });

  it('shows placeholder on network error (first-load failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(<AttendeeCounter />);

    // After the failed fetch settles, placeholder should still be shown (no crash)
    await waitFor(() => {
      expect(screen.getByText(/— watching/)).toBeInTheDocument();
    });
  });

  it('keeps last known count when a subsequent fetch fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ count: 3 }) })
      .mockRejectedValue(new Error('Network error'));

    vi.stubGlobal('fetch', fetchMock);

    render(<AttendeeCounter />);

    await waitFor(() => {
      expect(screen.getByText(/3 watching/)).toBeInTheDocument();
    });
    // Count should remain at 3 even after subsequent failures
    expect(screen.getByText(/3 watching/)).toBeInTheDocument();
  });

  it('ignores non-numeric count from API and keeps placeholder', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 'bad' }) }),
    );

    render(<AttendeeCounter />);

    // Should never render NaN or undefined — stays on placeholder
    await waitFor(() => {
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/— watching/)).toBeInTheDocument();
  });

  it('renders a non-negative count (zero is valid)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 0 }) }),
    );

    render(<AttendeeCounter />);

    await waitFor(() => {
      expect(screen.getByText(/0 watching/)).toBeInTheDocument();
    });
  });
});

describe('attendee-counter feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('attendee-counter');
  });

  it('targets the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });

  it('exports a Component', () => {
    expect(typeof feature.Component).toBe('function');
  });
});
