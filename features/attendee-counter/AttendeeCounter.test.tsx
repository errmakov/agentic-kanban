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
});
