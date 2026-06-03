import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './index';
import feature from './index';

const resolvedFetch = (count: number) =>
  vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ count }) }));

describe('AttendeeCounter', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders a placeholder before the first response, then the count', async () => {
    let resolve: (value: { count: number }) => void = () => {};
    const pending = new Promise<{ count: number }>((r) => {
      resolve = r;
    });
    const fetchMock = vi.fn(() => Promise.resolve({ json: () => pending }));
    vi.stubGlobal('fetch', fetchMock);

    render(<AttendeeCounter />);
    expect(screen.getByText(/… watching/)).toBeInTheDocument();

    resolve({ count: 42 });
    await waitFor(() =>
      expect(screen.getByText(/42 watching/)).toBeInTheDocument(),
    );
  });

  it('renders the 👀 emoji alongside the count', async () => {
    vi.stubGlobal('fetch', resolvedFetch(3));
    render(<AttendeeCounter />);
    await waitFor(() =>
      expect(screen.getByText(/👀.*watching/)).toBeInTheDocument(),
    );
  });

  it('displays count 0 correctly', async () => {
    vi.stubGlobal('fetch', resolvedFetch(0));
    render(<AttendeeCounter />);
    await waitFor(() =>
      expect(screen.getByText(/0 watching/)).toBeInTheDocument(),
    );
  });

  it('stores a new session ID in sessionStorage on first render', async () => {
    vi.stubGlobal('fetch', resolvedFetch(1));
    expect(sessionStorage.getItem('attendee-session-id')).toBeNull();
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(sessionStorage.getItem('attendee-session-id')).not.toBeNull();
    });
  });

  it('reuses an existing session ID from sessionStorage', async () => {
    const existingId = 'existing-session-id-abc';
    sessionStorage.setItem('attendee-session-id', existingId);

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ count: 1 }) }),
    ));

    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/attendee-counter',
        expect.objectContaining({ body: JSON.stringify({ sessionId: existingId }) }),
      );
    });
  });

  it('sends a POST heartbeat with sessionId in the request body', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ count: 5 }) }),
    ));

    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/attendee-counter',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"sessionId"'),
        }),
      );
    });
  });

  it('silently swallows fetch failures and keeps the placeholder', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
    render(<AttendeeCounter />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(screen.getByText(/… watching/)).toBeInTheDocument();
  });

  it('keeps last known count when a subsequent fetch fails', async () => {
    let callCount = 0;
    const fetchMock = vi.fn(() => {
      callCount++;
      if (callCount === 1)
        return Promise.resolve({ json: () => Promise.resolve({ count: 7 }) });
      return Promise.reject(new Error('Network error'));
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.useFakeTimers();

    render(<AttendeeCounter />);

    // flush the initial heartbeat call and its promise chain
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText(/7 watching/)).toBeInTheDocument();

    // advance past the poll interval; the failing poll should not reset the count
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_001);
    });
    expect(screen.getByText(/7 watching/)).toBeInTheDocument();
  });

  it('cleans up intervals on unmount', () => {
    vi.stubGlobal('fetch', resolvedFetch(1));
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = render(<AttendeeCounter />);
    const before = clearIntervalSpy.mock.calls.length;
    unmount();
    expect(clearIntervalSpy.mock.calls.length - before).toBe(2);
  });
});

describe('attendee-counter feature metadata', () => {
  it('has the correct feature id', () => {
    expect(feature.id).toBe('attendee-counter');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });

  it('uses AttendeeCounter as its Component', () => {
    expect(feature.Component).toBe(AttendeeCounter);
  });
});
