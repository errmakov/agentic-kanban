import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './index';
import feature from './index';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => ({ count: 42 }),
    }),
  );
  vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AttendeeCounter', () => {
  it('renders the count and "watching" label', async () => {
    render(<AttendeeCounter />);
    expect(await screen.findByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/watching/i)).toBeInTheDocument();
  });

  it('shows 0 watching before the first fetch resolves', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<AttendeeCounter />);
    expect(screen.getByText(/0 watching/i)).toBeInTheDocument();
  });

  it('sends a POST to /api/attendee-counter on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ count: 1 }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AttendeeCounter />);
    await screen.findByText(/1/);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/attendee-counter',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('includes sessionId in the POST body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ count: 1 }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AttendeeCounter />);
    await screen.findByText(/1/);
    const postCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === 'POST');
    expect(postCall).toBeDefined();
    const body = JSON.parse(postCall![1].body as string);
    expect(body.sessionId).toBe('test-uuid');
  });

  it('reuses sessionId stored in sessionStorage', async () => {
    sessionStorage.setItem('attendee-counter-sid', 'existing-id');
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ count: 5 }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AttendeeCounter />);
    await screen.findByText(/5/);
    const postCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === 'POST');
    const body = JSON.parse(postCall![1].body as string);
    expect(body.sessionId).toBe('existing-id');
  });

  it('falls back to a fresh UUID when sessionStorage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ count: 1 }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AttendeeCounter />);
    await screen.findByText(/1/);
    const postCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === 'POST');
    expect(postCall).toBeDefined();
    const body = JSON.parse(postCall![1].body as string);
    expect(typeof body.sessionId).toBe('string');
    expect(body.sessionId.length).toBeGreaterThan(0);
  });

  it('cleans up both intervals on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = render(<AttendeeCounter />);
    await screen.findByText(/42/);
    const countBefore = clearIntervalSpy.mock.calls.length;
    unmount();
    // Two clearInterval calls for the two intervals (heartbeat + poll)
    expect(clearIntervalSpy.mock.calls.length - countBefore).toBe(2);
  });
});

describe('attendee-counter feature descriptor', () => {
  it('has id "attendee-counter"', () => {
    expect(feature.id).toBe('attendee-counter');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });

  it('exposes the AttendeeCounter component', () => {
    expect(feature.Component).toBe(AttendeeCounter);
  });
});
