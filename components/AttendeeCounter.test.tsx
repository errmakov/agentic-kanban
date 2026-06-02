import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

function makeFetchMock(count: number) {
  return vi.fn((_url: string, init?: RequestInit) => {
    const body = init?.method === 'POST' ? { ok: true } : { count };
    return Promise.resolve({ json: () => Promise.resolve(body) });
  });
}

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', makeFetchMock(5));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('renders the loading placeholder before the first fetch resolves', () => {
    render(<AttendeeCounter />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the viewer count once the fetch resolves', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText('5 watching')).toBeInTheDocument();
    });
  });

  it('renders "1 watching" (singular) when the count is 1', async () => {
    vi.stubGlobal('fetch', makeFetchMock(1));
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText('1 watching')).toBeInTheDocument();
    });
  });

  it('silently stays on the loading placeholder when the GET fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
        }
        return Promise.reject(new Error('network error'));
      }),
    );
    render(<AttendeeCounter />);
    // Give effects time to run and fail
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('sends a POST heartbeat with a sessionId on mount', async () => {
    const fetchMock = makeFetchMock(5);
    vi.stubGlobal('fetch', fetchMock);
    render(<AttendeeCounter />);
    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(
        ([, init]) => init?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse(postCall![1]!.body as string);
      expect(typeof body.sessionId).toBe('string');
      expect(body.sessionId.length).toBeGreaterThan(0);
    });
  });

  it('reuses the sessionId stored in sessionStorage', async () => {
    const existingId = 'existing-session-id';
    sessionStorage.setItem('fw-session-id', existingId);
    const fetchMock = makeFetchMock(2);
    vi.stubGlobal('fetch', fetchMock);
    render(<AttendeeCounter />);
    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(
        ([, init]) => init?.method === 'POST',
      );
      expect(postCall).toBeDefined();
      const body = JSON.parse(postCall![1]!.body as string);
      expect(body.sessionId).toBe(existingId);
    });
  });
});
