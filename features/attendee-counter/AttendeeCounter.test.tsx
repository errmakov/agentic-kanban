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

  it('registers in the header slot', () => {
    expect(feature.id).toBe('attendee-counter');
    expect(feature.slot).toBe('header');
  });
});
