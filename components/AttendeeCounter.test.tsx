import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 42 }) }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the live viewer count from the presence API', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/42 viewing/)).toBeInTheDocument();
    });
  });
});
