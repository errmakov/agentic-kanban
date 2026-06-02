import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/attendees', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/attendees', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns count 0 when no sessions exist', async () => {
    const { GET } = await import('./route');
    const data = await GET().json();
    expect(data).toEqual({ count: 0 });
  });

  it('counts sessions active within the last 30 seconds', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const { GET, POST } = await import('./route');

    await POST(makePostRequest({ sessionId: 'session-a' }));

    vi.setSystemTime(new Date('2026-01-01T00:00:29.999Z'));
    const data = await GET().json();
    expect(data.count).toBe(1);
  });

  it('excludes sessions older than 30 seconds', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const { GET, POST } = await import('./route');

    await POST(makePostRequest({ sessionId: 'session-a' }));

    vi.setSystemTime(new Date('2026-01-01T00:00:31.000Z'));
    const data = await GET().json();
    expect(data.count).toBe(0);
  });

  it('counts multiple active sessions independently', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const { GET, POST } = await import('./route');

    await POST(makePostRequest({ sessionId: 'session-a' }));
    await POST(makePostRequest({ sessionId: 'session-b' }));
    await POST(makePostRequest({ sessionId: 'session-c' }));

    const data = await GET().json();
    expect(data.count).toBe(3);
  });
});

describe('POST /api/attendees', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns { ok: true } with a valid sessionId', async () => {
    const { POST } = await import('./route');
    const response = await POST(makePostRequest({ sessionId: 'test-session' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('returns 400 when sessionId is missing', async () => {
    const { POST } = await import('./route');
    const response = await POST(makePostRequest({}));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false });
  });

  it('makes the registered session visible to GET immediately', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const { GET, POST } = await import('./route');

    await POST(makePostRequest({ sessionId: 'session-a' }));

    const data = await GET().json();
    expect(data.count).toBe(1);
  });

  it('refreshes an existing session so it stays active past the original window', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const { GET, POST } = await import('./route');

    await POST(makePostRequest({ sessionId: 'session-a' }));

    // Advance to just before expiry and send a new heartbeat
    vi.setSystemTime(new Date('2026-01-01T00:00:25.000Z'));
    await POST(makePostRequest({ sessionId: 'session-a' }));

    // Advance another 20 seconds — 45 s after original, 20 s after refresh
    vi.setSystemTime(new Date('2026-01-01T00:00:45.000Z'));
    const data = await GET().json();
    expect(data.count).toBe(1);
  });

  it('prunes stale sessions (>60 s) when a new heartbeat arrives', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const { GET, POST } = await import('./route');

    await POST(makePostRequest({ sessionId: 'old-session' }));

    // Advance past stale window and send a fresh heartbeat for a new session
    vi.setSystemTime(new Date('2026-01-01T00:01:05.000Z'));
    await POST(makePostRequest({ sessionId: 'new-session' }));

    // Advance another 20 s — old-session was pruned, new-session is 20 s old (active)
    vi.setSystemTime(new Date('2026-01-01T00:01:25.000Z'));
    const data = await GET().json();
    expect(data.count).toBe(1);
  });
});
