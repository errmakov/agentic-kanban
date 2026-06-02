import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 7 }) }),
    );
  });

  it('renders the live viewer count from the API', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByLabelText('live viewer count')).toHaveTextContent('7 viewing');
    });
  });
});
