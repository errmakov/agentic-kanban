import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ count: 5 }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('renders the live viewer count after fetching', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/5 viewing/i)).toBeInTheDocument();
    });
  });
});
