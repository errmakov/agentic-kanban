import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Each test gets a fresh temp dir and a freshly-imported route module so that
// the module-level `dir` variable picks up the correct DATA_DIR value.
const BASE = path.join(tmpdir(), `countdown-route-test-${process.pid}`);
let seq = 0;

async function setupRoute() {
  const testDir = path.join(BASE, String(seq++));
  await mkdir(testDir, { recursive: true });
  process.env.DATA_DIR = testDir;
  vi.resetModules();
  const route = await import('./route');
  return { GET: route.GET, POST: route.POST, DELETE: route.DELETE, testDir };
}

afterEach(async () => {
  delete process.env.DATA_DIR;
  await rm(BASE, { recursive: true, force: true }).catch(() => {});
});

describe('GET /api/countdown', () => {
  it('returns idle state when the data file does not exist', async () => {
    const { GET } = await setupRoute();
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ startedAt: null, durationSeconds: 0 });
  });

  it('returns the persisted state when the data file exists', async () => {
    const { GET, testDir } = await setupRoute();
    const state = { startedAt: 1720000000000, durationSeconds: 300 };
    await writeFile(path.join(testDir, 'countdown.json'), JSON.stringify(state));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(state);
  });
});

describe('POST /api/countdown', () => {
  function makeRequest(body: unknown) {
    return new Request('http://localhost/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('creates a timer and returns the persisted state', async () => {
    const { POST } = await setupRoute();
    const res = await POST(makeRequest({ durationSeconds: 150 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.durationSeconds).toBe(150);
    expect(typeof data.startedAt).toBe('number');
  });

  it('returns 400 when durationSeconds is 0', async () => {
    const { POST } = await setupRoute();
    const res = await POST(makeRequest({ durationSeconds: 0 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when durationSeconds exceeds 5999', async () => {
    const { POST } = await setupRoute();
    const res = await POST(makeRequest({ durationSeconds: 6000 }));
    expect(res.status).toBe(400);
  });

  it('accepts the boundary value durationSeconds=5999', async () => {
    const { POST } = await setupRoute();
    const res = await POST(makeRequest({ durationSeconds: 5999 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.durationSeconds).toBe(5999);
  });

  it('returns 400 when durationSeconds is a float', async () => {
    const { POST } = await setupRoute();
    const res = await POST(makeRequest({ durationSeconds: 1.5 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when durationSeconds is missing', async () => {
    const { POST } = await setupRoute();
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when the body is not valid JSON', async () => {
    const { POST } = await setupRoute();
    const req = new Request('http://localhost/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/countdown', () => {
  it('resets the timer to idle state', async () => {
    const { DELETE, POST } = await setupRoute();
    // Start a timer first, then reset it
    await POST(
      new Request('http://localhost/api/countdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSeconds: 60 }),
      }),
    );
    const res = await DELETE();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ startedAt: null, durationSeconds: 0 });
  });
});
