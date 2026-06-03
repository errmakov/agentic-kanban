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

  it('has an accessible aria-label describing its purpose', () => {
    render(<AttendeeCounter />);
    expect(screen.getByRole('generic', { name: /people watching the wall/i })).toBeInTheDocument();
  });

  it('fires a POST heartbeat on mount to register the session', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        '/api/attendee-counter',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

  it('includes a sessionId in the POST body', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      const calls = vi.mocked(global.fetch).mock.calls;
      const postCall = calls.find(
        ([, opts]) => (opts as RequestInit)?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse((postCall![1] as RequestInit).body as string);
      expect(body).toHaveProperty('sessionId');
      expect(typeof body.sessionId).toBe('string');
      expect(body.sessionId.length).toBeGreaterThan(0);
    });
  });

  it('does not crash when the initial heartbeat request fails', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
    render(<AttendeeCounter />);
    // Component should remain showing the placeholder without throwing
    expect(screen.getByText(/— watching/)).toBeInTheDocument();
  });
});
