import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => {
  const readFile = vi.fn();
  const writeFile = vi.fn().mockResolvedValue(undefined);
  const mkdir = vi.fn().mockResolvedValue(undefined);
  const promises = { readFile, writeFile, mkdir };
  return { default: { promises }, promises };
});

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(data),
    }),
  },
}));

import { GET, POST } from './route';
import { promises as fsp } from 'fs';

function makeStore(sessions: Record<string, number>) {
  return JSON.stringify({ sessions });
}

function makePostRequest(body: unknown) {
  return new Request('http://localhost/api/attendee-counter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(fsp.readFile).mockReset();
  vi.mocked(fsp.writeFile).mockReset().mockResolvedValue(undefined);
  vi.mocked(fsp.mkdir).mockReset().mockResolvedValue(undefined);
});

describe('GET /api/attendee-counter', () => {
  it('returns count 0 when data file does not exist', async () => {
    vi.mocked(fsp.readFile).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const response = await GET();
    expect(await response.json()).toEqual({ count: 0 });
    expect(response.status).toBe(200);
  });

  it('returns the correct count of active sessions', async () => {
    const now = Date.now();
    vi.mocked(fsp.readFile).mockResolvedValue(makeStore({ a: now - 1_000, b: now - 2_000 }) as never);
    const response = await GET();
    expect(await response.json()).toEqual({ count: 2 });
  });

  it('excludes sessions whose heartbeat is older than 60 seconds', async () => {
    const now = Date.now();
    vi.mocked(fsp.readFile).mockResolvedValue(
      makeStore({ fresh: now - 1_000, stale: now - 70_000 }) as never,
    );
    const response = await GET();
    expect(await response.json()).toEqual({ count: 1 });
  });

  it('returns count 0 when all sessions are stale', async () => {
    const now = Date.now();
    vi.mocked(fsp.readFile).mockResolvedValue(makeStore({ old: now - 120_000 }) as never);
    const response = await GET();
    expect(await response.json()).toEqual({ count: 0 });
  });

  it('returns count 0 when the store has no sessions', async () => {
    vi.mocked(fsp.readFile).mockResolvedValue(makeStore({}) as never);
    const response = await GET();
    expect(await response.json()).toEqual({ count: 0 });
  });
});

describe('POST /api/attendee-counter', () => {
  it('returns 400 when sessionId is missing', async () => {
    vi.mocked(fsp.readFile).mockResolvedValue(makeStore({}) as never);
    const response = await POST(makePostRequest({}));
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error');
  });

  it('returns 400 when body has no sessionId field', async () => {
    vi.mocked(fsp.readFile).mockResolvedValue(makeStore({}) as never);
    const response = await POST(makePostRequest({ other: 'field' }));
    expect(response.status).toBe(400);
  });

  it('upserts a new session and returns count 1 when store was empty', async () => {
    vi.mocked(fsp.readFile).mockRejectedValue(new Error('ENOENT'));
    const response = await POST(makePostRequest({ sessionId: 'sess-abc' }));
    expect(await response.json()).toEqual({ count: 1 });
  });

  it('adds a new session to existing active sessions', async () => {
    const now = Date.now();
    vi.mocked(fsp.readFile).mockResolvedValue(makeStore({ existing: now - 1_000 }) as never);
    const response = await POST(makePostRequest({ sessionId: 'new-sess' }));
    expect(await response.json()).toEqual({ count: 2 });
  });

  it('prunes stale sessions before returning the count', async () => {
    const now = Date.now();
    vi.mocked(fsp.readFile).mockResolvedValue(
      makeStore({ fresh: now - 1_000, stale: now - 70_000 }) as never,
    );
    const response = await POST(makePostRequest({ sessionId: 'new-sess' }));
    expect(await response.json()).toEqual({ count: 2 });
  });

  it('creates the data directory with recursive:true before writing', async () => {
    vi.mocked(fsp.readFile).mockRejectedValue(new Error('ENOENT'));
    await POST(makePostRequest({ sessionId: 'sess-1' }));
    expect(vi.mocked(fsp.mkdir)).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('writes the updated store to disk', async () => {
    vi.mocked(fsp.readFile).mockRejectedValue(new Error('ENOENT'));
    await POST(makePostRequest({ sessionId: 'sess-1' }));
    expect(vi.mocked(fsp.writeFile)).toHaveBeenCalledOnce();
    const written = JSON.parse(vi.mocked(fsp.writeFile).mock.calls[0][1] as string);
    expect(written.sessions).toHaveProperty('sess-1');
  });

  it('updates the timestamp for an already-registered sessionId', async () => {
    const now = Date.now();
    const oldTs = now - 5_000;
    vi.mocked(fsp.readFile).mockResolvedValue(makeStore({ 'existing-sess': oldTs }) as never);
    await POST(makePostRequest({ sessionId: 'existing-sess' }));
    const written = JSON.parse(vi.mocked(fsp.writeFile).mock.calls[0][1] as string);
    expect(written.sessions['existing-sess']).toBeGreaterThan(oldTs);
    expect(Object.keys(written.sessions)).toHaveLength(1);
  });
});
