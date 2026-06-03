import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// NextResponse.json must return a real Response so callers can .json() it.
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}));

type RouteModule = typeof import('./route');

let tempDir: string;
let GET: RouteModule['GET'];
let POST: RouteModule['POST'];

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'test-attendee-'));
  process.env.DATA_DIR = tempDir;
  // Reset the module registry so DATA_DIR is re-evaluated on re-import.
  vi.resetModules();
  const mod = (await import('./route')) as RouteModule;
  GET = mod.GET;
  POST = mod.POST;
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
  delete process.env.DATA_DIR;
});

async function writeSessions(sessions: Record<string, number>) {
  await writeFile(join(tempDir, 'attendee-counter.json'), JSON.stringify(sessions), 'utf8');
}

describe('GET /api/attendee-counter', () => {
  it('returns count 0 when the data file does not exist', async () => {
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual({ count: 0 });
    expect(response.status).toBe(200);
  });

  it('counts only sessions with a heartbeat within the last 30 seconds', async () => {
    const now = Date.now();
    await writeSessions({
      'active-1': now - 10_000, // 10s ago — inside window
      'active-2': now - 29_000, // 29s ago — just inside window
      'inactive': now - 31_000, // 31s ago — outside window
    });
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual({ count: 2 });
  });

  it('returns count 0 when all sessions are outside the active window', async () => {
    const now = Date.now();
    await writeSessions({
      'old-1': now - 31_000,
      'old-2': now - 45_000,
    });
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual({ count: 0 });
  });
});

describe('POST /api/attendee-counter', () => {
  it('returns 400 when sessionId is missing from the request body', async () => {
    const request = new Request('http://localhost/api/attendee-counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'sessionId is required' });
  });

  it('registers a new session and returns active count of 1', async () => {
    const request = new Request('http://localhost/api/attendee-counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'new-session' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ count: 1 });
  });

  it('updates an existing session timestamp and counts it once', async () => {
    const now = Date.now();
    await writeSessions({ 'my-session': now - 25_000 });

    const request = new Request('http://localhost/api/attendee-counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'my-session' }),
    });
    const response = await POST(request);
    const data = await response.json();
    // still just 1 session — the existing one was updated, not duplicated
    expect(data).toEqual({ count: 1 });
  });

  it('prunes sessions older than 60 seconds before writing', async () => {
    const now = Date.now();
    await writeSessions({
      'stale': now - 61_000,   // 61s — should be pruned
      'recent': now - 10_000,  // 10s — should remain
    });
    const request = new Request('http://localhost/api/attendee-counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'new-session' }),
    });
    await POST(request);

    const { readFile } = await import('node:fs/promises');
    const written = JSON.parse(await readFile(join(tempDir, 'attendee-counter.json'), 'utf8'));
    expect(written).not.toHaveProperty('stale');
    expect(written).toHaveProperty('recent');
    expect(written).toHaveProperty('new-session');
  });

  it('does not count sessions between 30s–60s old in the returned count', async () => {
    const now = Date.now();
    await writeSessions({
      'between': now - 45_000,    // 45s — not pruned but not active
      'very-stale': now - 65_000, // 65s — pruned
      'fresh': now - 5_000,       // 5s — counted
    });
    const request = new Request('http://localhost/api/attendee-counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'new-session' }),
    });
    const response = await POST(request);
    const data = await response.json();
    // 'fresh' (5s) + 'new-session' (0s) = 2; 'between' not counted; 'very-stale' pruned
    expect(data).toEqual({ count: 2 });
  });
});
