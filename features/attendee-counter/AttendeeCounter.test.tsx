import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const { Component: AttendeeCounter } = feature;

function makeFetch(count = 42) {
  return vi.fn((_url: string, init?: RequestInit) =>
    Promise.resolve({
      json: () =>
        Promise.resolve(init?.method === 'POST' ? { ok: true } : { count }),
    } as Response),
  );
}

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', makeFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('renders the live viewer count after fetching', async () => {
    render(<AttendeeCounter />);
    expect(await screen.findByText(/42 watching/)).toBeInTheDocument();
  });

  it('shows a dash placeholder while the count is still loading', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<AttendeeCounter />);
    expect(screen.getByText(/— watching/)).toBeInTheDocument();
  });

  it('sends a POST heartbeat with the sessionId on mount', async () => {
    const mockFetch = makeFetch(1);
    vi.stubGlobal('fetch', mockFetch);

    render(<AttendeeCounter />);

    await waitFor(() => {
      const postCalls = mockFetch.mock.calls.filter(([, init]) => init?.method === 'POST');
      expect(postCalls.length).toBeGreaterThan(0);
      const body = JSON.parse(postCalls[0][1]?.body as string);
      expect(typeof body.sessionId).toBe('string');
      expect(body.sessionId.length).toBeGreaterThan(0);
    });
  });

  it('reuses the sessionId stored in sessionStorage', async () => {
    sessionStorage.setItem('attendee-session-id', 'fixed-session-abc');
    const mockFetch = makeFetch(1);
    vi.stubGlobal('fetch', mockFetch);

    render(<AttendeeCounter />);

    await waitFor(() => {
      const postCalls = mockFetch.mock.calls.filter(([, init]) => init?.method === 'POST');
      expect(postCalls.length).toBeGreaterThan(0);
      const body = JSON.parse(postCalls[0][1]?.body as string);
      expect(body.sessionId).toBe('fixed-session-abc');
    });
  });

  it('does not crash when fetch throws a network error', () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network error'))));
    expect(() => render(<AttendeeCounter />)).not.toThrow();
    expect(screen.getByText(/— watching/)).toBeInTheDocument();
  });

  it('includes the eye emoji in the rendered output', async () => {
    render(<AttendeeCounter />);
    const el = await screen.findByText(/42 watching/);
    expect(el.textContent).toContain('👀');
  });
});

describe('feature descriptor', () => {
  it('has id "attendee-counter"', () => {
    expect(feature.id).toBe('attendee-counter');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 10 to sort before other header features', () => {
    expect(feature.order).toBe(10);
  });

  it('exports a Component', () => {
    expect(typeof feature.Component).toBe('function');
  });
});
