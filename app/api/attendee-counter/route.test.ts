import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('attendee-counter API route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('GET returns count 0 when no sessions are registered', async () => {
    const { GET } = await import('./route');
    const res = await GET();
    const data = await res.json();
    expect(data.count).toBe(0);
  });

  it('POST registers a session and returns count 1', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/attendee-counter', {
      method: 'POST',
      body: JSON.stringify({ sessionId: 'session-a' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.count).toBe(1);
  });

  it('POST with the same sessionId does not increment the count', async () => {
    const { POST } = await import('./route');
    const makeReq = () =>
      new Request('http://localhost/api/attendee-counter', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'dup-session' }),
        headers: { 'Content-Type': 'application/json' },
      });
    await POST(makeReq());
    const res = await POST(makeReq());
    const data = await res.json();
    expect(data.count).toBe(1);
  });

  it('counts multiple distinct sessions', async () => {
    const { POST, GET } = await import('./route');
    for (const id of ['s1', 's2', 's3']) {
      await POST(
        new Request('http://localhost/api/attendee-counter', {
          method: 'POST',
          body: JSON.stringify({ sessionId: id }),
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
    const res = await GET();
    const data = await res.json();
    expect(data.count).toBe(3);
  });

  it('GET does not count sessions older than 60 seconds', async () => {
    const { POST, GET } = await import('./route');
    await POST(
      new Request('http://localhost/api/attendee-counter', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'soon-stale' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.advanceTimersByTime(61_000);
    const res = await GET();
    const data = await res.json();
    expect(data.count).toBe(0);
  });

  it('POST sweeps stale entries and returns only the fresh count', async () => {
    const { POST } = await import('./route');
    await POST(
      new Request('http://localhost/api/attendee-counter', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'stale' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.advanceTimersByTime(61_000);
    const res = await POST(
      new Request('http://localhost/api/attendee-counter', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'fresh' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const data = await res.json();
    expect(data.count).toBe(1);
  });

  it('a refreshed session resets its staleness timer', async () => {
    const { POST, GET } = await import('./route');
    const postReq = () =>
      new Request('http://localhost/api/attendee-counter', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'refreshed' }),
        headers: { 'Content-Type': 'application/json' },
      });
    await POST(postReq());
    vi.advanceTimersByTime(45_000);
    await POST(postReq()); // refresh before stale window expires
    vi.advanceTimersByTime(45_000); // total 90s from first POST, only 45s from refresh
    const res = await GET();
    const data = await res.json();
    expect(data.count).toBe(1); // still active because of refresh
  });
});
