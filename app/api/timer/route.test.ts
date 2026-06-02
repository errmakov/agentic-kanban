import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  },
}));

const testDataDir = join(tmpdir(), `factorywall-timer-${process.pid}`);
const timerFile = join(testDataDir, 'timer.json');

beforeAll(async () => {
  process.env.DATA_DIR = testDataDir;
  await mkdir(testDataDir, { recursive: true });
});

afterAll(async () => {
  await rm(testDataDir, { recursive: true, force: true });
  delete process.env.DATA_DIR;
});

beforeEach(async () => {
  vi.resetModules();
  try {
    await rm(timerFile);
  } catch {
    // file may not exist between tests
  }
});

describe('GET /api/timer', () => {
  it('returns idle state when timer file does not exist', async () => {
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body).toEqual({ endsAt: null, status: 'idle' });
    expect(response.status).toBe(200);
  });

  it('returns running state when timer is still active', async () => {
    const endsAt = Date.now() + 60_000;
    await writeFile(timerFile, JSON.stringify({ endsAt, status: 'running' }));
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body).toEqual({ endsAt, status: 'running' });
  });

  it('rewrites file and returns expired when running timer has passed endsAt', async () => {
    const endsAt = Date.now() - 5_000;
    await writeFile(timerFile, JSON.stringify({ endsAt, status: 'running' }));
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body).toEqual({ endsAt, status: 'expired' });
    const saved = JSON.parse(await readFile(timerFile, 'utf8'));
    expect(saved).toEqual({ endsAt, status: 'expired' });
  });

  it('returns idle state when file contains idle status', async () => {
    await writeFile(timerFile, JSON.stringify({ endsAt: null, status: 'idle' }));
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body).toEqual({ endsAt: null, status: 'idle' });
  });

  it('returns expired state as-is when already expired', async () => {
    const endsAt = Date.now() - 1_000;
    await writeFile(timerFile, JSON.stringify({ endsAt, status: 'expired' }));
    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();
    expect(body).toEqual({ endsAt, status: 'expired' });
    expect(response.status).toBe(200);
  });
});

describe('POST /api/timer', () => {
  function makeRequest(body: unknown): Request {
    return new Request('http://localhost/api/timer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns running state when starting with valid durationMs', async () => {
    const { POST } = await import('./route');
    const before = Date.now();
    const response = await POST(makeRequest({ action: 'start', durationMs: 60_000 }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe('running');
    expect(body.endsAt).toBeGreaterThanOrEqual(before + 60_000);
    const saved = JSON.parse(await readFile(timerFile, 'utf8'));
    expect(saved.status).toBe('running');
  });

  it('returns 400 when durationMs is 0', async () => {
    const { POST } = await import('./route');
    const response = await POST(makeRequest({ action: 'start', durationMs: 0 }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('invalid durationMs');
  });

  it('returns 400 when durationMs is negative', async () => {
    const { POST } = await import('./route');
    const response = await POST(makeRequest({ action: 'start', durationMs: -500 }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when durationMs is not a finite number', async () => {
    const { POST } = await import('./route');
    const response = await POST(makeRequest({ action: 'start', durationMs: 'not-a-number' }));
    expect(response.status).toBe(400);
  });

  it('resets timer to idle and writes the state to file', async () => {
    const { POST } = await import('./route');
    const response = await POST(makeRequest({ action: 'reset' }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ endsAt: null, status: 'idle' });
    const saved = JSON.parse(await readFile(timerFile, 'utf8'));
    expect(saved).toEqual({ endsAt: null, status: 'idle' });
  });

  it('returns 400 for an unknown action', async () => {
    const { POST } = await import('./route');
    const response = await POST(makeRequest({ action: 'unknown' }));
    expect(response.status).toBe(400);
  });
});
