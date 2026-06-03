import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './index';
import feature from './index';

describe('AttendeeCounter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the placeholder before the first fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<AttendeeCounter />);
    expect(screen.getByText('— watching')).toBeInTheDocument();
  });

  it('renders the watching count after fetch resolves', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ count: 3 }) })
    ));
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/3 watching/)).toBeInTheDocument();
    });
  });

  it('shows count of 1 when only one viewer is watching', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ count: 1 }) })
    ));
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/1 watching/i)).toBeInTheDocument();
    });
  });

  it('POSTs to /api/attendee-counter with Content-Type and a session id', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ count: 1 }) })
    );
    vi.stubGlobal('fetch', mockFetch);
    render(<AttendeeCounter />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/attendee-counter');
    expect(opts.method).toBe('POST');
    expect((opts.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    const body = JSON.parse(opts.body as string) as { id: string };
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThan(0);
  });

  it('uses the same session id on every heartbeat call', async () => {
    const calls: string[] = [];
    const mockFetch = vi.fn(() => {
      return Promise.resolve({ json: () => Promise.resolve({ count: 1 }) });
    });
    vi.stubGlobal('fetch', mockFetch);
    render(<AttendeeCounter />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const firstId = (JSON.parse((mockFetch.mock.calls[0] as [string, RequestInit])[1].body as string) as { id: string }).id;
    expect(firstId).toBeTruthy();
    calls.push(firstId);

    // All ids captured should be the same stable session id
    for (const call of mockFetch.mock.calls as [string, RequestInit][]) {
      const parsed = JSON.parse(call[1].body as string) as { id: string };
      expect(parsed.id).toBe(calls[0]);
    }
  });

  it('updates the displayed count when the API returns a new value', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ count: 7 }) })
    ));
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/7 watching/)).toBeInTheDocument();
    });
  });
});

describe('feature descriptor', () => {
  it('has id "attendee-counter"', () => {
    expect(feature.id).toBe('attendee-counter');
  });

  it('is placed in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });

  it('exports AttendeeCounter as the Component', () => {
    expect(feature.Component).toBe(AttendeeCounter);
  });
});
