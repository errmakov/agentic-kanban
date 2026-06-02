import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown) =>
      new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
      }),
  },
}));

function makePostRequest(sessionId: unknown) {
  return new Request('http://localhost/api/attendees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
}

describe('GET /api/attendees', () => {
  beforeEach(() => vi.resetModules());

  it('returns count 0 with no sessions', async () => {
    const { GET } = await import('./route');
    const data = await GET().json();
    expect(data).toEqual({ count: 0 });
  });
});

describe('POST /api/attendees', () => {
  beforeEach(() => vi.resetModules());

  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers a valid sessionId and returns count 1', async () => {
    const { POST } = await import('./route');
    const data = await (await POST(makePostRequest('session-abc'))).json();
    expect(data.count).toBe(1);
  });

  it('does not register an empty sessionId', async () => {
    const { POST } = await import('./route');
    const data = await (await POST(makePostRequest(''))).json();
    expect(data.count).toBe(0);
  });

  it('does not register a non-string sessionId', async () => {
    const { POST } = await import('./route');
    const data = await (await POST(makePostRequest(42))).json();
    expect(data.count).toBe(0);
  });

  it('counts the same sessionId only once', async () => {
    const { POST } = await import('./route');
    await POST(makePostRequest('dup-session'));
    const data = await (await POST(makePostRequest('dup-session'))).json();
    expect(data.count).toBe(1);
  });

  it('counts distinct sessionIds separately', async () => {
    const { POST } = await import('./route');
    await POST(makePostRequest('session-1'));
    const data = await (await POST(makePostRequest('session-2'))).json();
    expect(data.count).toBe(2);
  });

  it('prunes sessions older than 30 s', async () => {
    vi.useFakeTimers();
    const { POST } = await import('./route');

    await POST(makePostRequest('old-session'));
    vi.advanceTimersByTime(31_000);

    const data = await (await POST(makePostRequest('new-session'))).json();
    expect(data.count).toBe(1);
  });

  it('GET prunes sessions older than 30 s', async () => {
    vi.useFakeTimers();
    const { POST, GET } = await import('./route');

    await POST(makePostRequest('stale-session'));
    vi.advanceTimersByTime(31_000);

    const data = await GET().json();
    expect(data.count).toBe(0);
  });
});
