import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const { Component: AttendeeCounter } = feature;

function makeFetch(count: number) {
  return vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count }) });
}

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the watching label with initial count of 0', () => {
    vi.stubGlobal('fetch', makeFetch(0));
    render(<AttendeeCounter />);
    expect(screen.getByText(/watching/i)).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('displays count returned from the initial heartbeat POST', async () => {
    vi.stubGlobal('fetch', makeFetch(7));
    render(<AttendeeCounter />);
    await act(async () => {});
    expect(screen.getByText(/7/)).toBeInTheDocument();
    expect(screen.getByText(/watching/i)).toBeInTheDocument();
  });

  it('sends a POST heartbeat on mount with Content-Type and sessionId in body', async () => {
    const mockFetch = makeFetch(1);
    vi.stubGlobal('fetch', mockFetch);
    render(<AttendeeCounter />);
    await act(async () => {});
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/attendee-counter',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const call = mockFetch.mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body.sessionId).toBeTruthy();
  });

  it('polls GET /api/attendee-counter every 10 seconds', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ count: 1 }) })
      .mockResolvedValue({ json: () => Promise.resolve({ count: 3 }) });
    vi.stubGlobal('fetch', mockFetch);
    render(<AttendeeCounter />);
    await act(async () => {});

    await act(async () => {
      vi.advanceTimersByTime(10_001);
    });

    // A GET call has no second argument (no method/headers/body options)
    const getCalls = mockFetch.mock.calls.filter((c) => !c[1]);
    expect(getCalls.length).toBeGreaterThan(0);
    expect(getCalls[0][0]).toBe('/api/attendee-counter');
  });

  it('sends a POST heartbeat again after 30 seconds', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 2 }) });
    vi.stubGlobal('fetch', mockFetch);
    render(<AttendeeCounter />);
    await act(async () => {});

    const callsBefore = mockFetch.mock.calls.filter(
      (c) => c[1] && (c[1] as RequestInit).method === 'POST',
    ).length;

    await act(async () => {
      vi.advanceTimersByTime(30_001);
    });

    const callsAfter = mockFetch.mock.calls.filter(
      (c) => c[1] && (c[1] as RequestInit).method === 'POST',
    ).length;
    expect(callsAfter).toBeGreaterThan(callsBefore);
  });

  it('does not crash when fetch rejects with a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    expect(() => render(<AttendeeCounter />)).not.toThrow();
    await act(async () => {});
    expect(screen.getByText(/watching/i)).toBeInTheDocument();
  });

  it('clears both intervals on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    vi.stubGlobal('fetch', makeFetch(0));
    const { unmount } = render(<AttendeeCounter />);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
  });
});

describe('feature descriptor', () => {
  it('has id attendee-counter', () => {
    expect(feature.id).toBe('attendee-counter');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });
});
