import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node:fs/promises', () => {
  const mkdir = vi.fn().mockResolvedValue(undefined);
  const readFile = vi.fn();
  const writeFile = vi.fn().mockResolvedValue(undefined);
  return { default: { mkdir, readFile, writeFile }, mkdir, readFile, writeFile };
});

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { GET, POST } from './route';

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

const NOW = 1_700_000_000_000;

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/attendee-counter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('GET /api/attendee-counter', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  it('returns count 0 when the data file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
    );
    const res = await GET();
    expect(await res.json()).toEqual({ count: 0 });
  });

  it('returns the number of active viewers', async () => {
    const presence = { 'v-1': NOW - 1_000, 'v-2': NOW - 10_000 };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(presence) as unknown as Buffer);
    const res = await GET();
    expect(await res.json()).toEqual({ count: 2 });
  });

  it('excludes viewers whose heartbeat is older than 30 s', async () => {
    const presence = {
      'v-active': NOW - 1_000,
      'v-stale': NOW - 30_001,
      'v-very-old': NOW - 60_000,
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(presence) as unknown as Buffer);
    const res = await GET();
    expect(await res.json()).toEqual({ count: 1 });
  });

  it('counts a viewer whose heartbeat is exactly at the TTL boundary as stale', async () => {
    // now - seen < ACTIVE_TTL_MS, so exactly 30_000 is NOT active
    const presence = { 'v-boundary': NOW - 30_000 };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(presence) as unknown as Buffer);
    const res = await GET();
    expect(await res.json()).toEqual({ count: 0 });
  });
});

describe('POST /api/attendee-counter', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(mkdir).mockResolvedValue(undefined);
  });

  it('returns 400 when id is absent from the body', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'missing id' });
  });

  it('returns 400 when id is an empty string', async () => {
    const res = await POST(makeRequest({ id: '' }));
    expect(res.status).toBe(400);
  });

  it('records the heartbeat and returns the active count', async () => {
    const res = await POST(makeRequest({ id: 'tab-abc' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 1 });
  });

  it('persists the updated presence map', async () => {
    await POST(makeRequest({ id: 'tab-abc' }));
    expect(writeFile).toHaveBeenCalledOnce();
    const written = JSON.parse(
      vi.mocked(writeFile).mock.calls[0][1] as string,
    ) as Record<string, number>;
    expect(written['tab-abc']).toBe(NOW);
  });

  it('ensures the data directory exists before writing', async () => {
    await POST(makeRequest({ id: 'tab-abc' }));
    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('includes pre-existing active viewers in the returned count', async () => {
    const existing = { 'v-existing': NOW - 5_000 };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(existing) as unknown as Buffer);
    const res = await POST(makeRequest({ id: 'tab-new' }));
    expect(await res.json()).toEqual({ count: 2 });
  });
});
