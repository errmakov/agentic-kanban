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

  it('shows — before the first poll resolves', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<AttendeeCounter />);
    expect(screen.getByText(/watching/i).textContent).toContain('—');
  });

  it('shows the count returned by the poll', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/watching/i).textContent).toContain('3');
    });
  });

  it('includes the session ID in the POST heartbeat body', async () => {
    sessionStorage.setItem('aw-session-id', 'known-session-123');
    render(<AttendeeCounter />);
    await waitFor(() => {
      const postCall = vi.mocked(fetch).mock.calls.find(
        ([, opts]) => (opts as RequestInit)?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse((postCall![1] as RequestInit).body as string);
      expect(body.sessionId).toBe('known-session-123');
    });
  });

  it('reuses an existing session ID from sessionStorage', async () => {
    sessionStorage.setItem('aw-session-id', 'existing-session-abc');
    render(<AttendeeCounter />);
    const { unmount } = render(<AttendeeCounter />);
    await waitFor(() => {
      const postCalls = vi.mocked(fetch).mock.calls.filter(
        ([, opts]) => (opts as RequestInit)?.method === 'POST',
      );
      postCalls.forEach((call) => {
        const body = JSON.parse((call[1] as RequestInit).body as string);
        expect(body.sessionId).toBe('existing-session-abc');
      });
    });
    unmount();
  });

  it('has the correct feature id, slot, and order', () => {
    expect(feature.id).toBe('attendee-counter');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(10);
  });
});
