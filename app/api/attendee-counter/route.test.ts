// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

import { readFile, writeFile, mkdir } from 'fs/promises';
import { GET, POST } from './route';

function makeEnoentError(): NodeJS.ErrnoException {
  const err = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
  err.code = 'ENOENT';
  return err;
}

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/attendee-counter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/attendee-counter', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000_000_000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(readFile).mockReset();
  });

  it('returns count 0 when the data file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(makeEnoentError());

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ count: 0 });
  });

  it('returns count of sessions active within the 90s TTL', async () => {
    const now = 1_000_000_000_000;
    const sessions = {
      'active-session': now - 80_000,
      'stale-session': now - 100_000,
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ sessions }) as any);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ count: 1 });
  });

  it('returns 0 when all sessions are stale', async () => {
    const now = 1_000_000_000_000;
    const sessions = {
      'old-a': now - 200_000,
      'old-b': now - 150_000,
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ sessions }) as any);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ count: 0 });
  });

  it('counts all sessions when all are active', async () => {
    const now = 1_000_000_000_000;
    const sessions = {
      's1': now - 10_000,
      's2': now - 20_000,
      's3': now - 30_000,
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ sessions }) as any);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ count: 3 });
  });

  it('propagates unexpected read errors', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('disk failure'));

    await expect(GET()).rejects.toThrow('disk failure');
  });
});

describe('POST /api/attendee-counter', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000_000_000);
    vi.mocked(readFile).mockRejectedValue(makeEnoentError());
    vi.mocked(writeFile).mockResolvedValue(undefined);
    vi.mocked(mkdir).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(readFile).mockReset();
  });

  it('returns 400 when sessionId is missing', async () => {
    const req = makePostRequest({});
    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'sessionId required' });
  });

  it('returns 400 when body has an empty sessionId', async () => {
    const req = makePostRequest({ sessionId: '' });
    const response = await POST(req);

    expect(response.status).toBe(400);
  });

  it('records the session and returns updated count', async () => {
    const req = makePostRequest({ sessionId: 'new-session' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ count: 1 });
  });

  it('creates the data directory before writing', async () => {
    const req = makePostRequest({ sessionId: 'any-session' });
    await POST(req);

    expect(vi.mocked(mkdir)).toHaveBeenCalledWith(
      expect.any(String),
      { recursive: true },
    );
  });

  it('prunes stale sessions on write', async () => {
    const now = 1_000_000_000_000;
    const sessions = {
      'stale-a': now - 200_000,
      'stale-b': now - 100_000,
      'active': now - 50_000,
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ sessions }) as any);

    const req = makePostRequest({ sessionId: 'new-session' });
    await POST(req);

    const written = JSON.parse(vi.mocked(writeFile).mock.calls[0][1] as string);
    expect(Object.keys(written.sessions)).not.toContain('stale-a');
    expect(Object.keys(written.sessions)).not.toContain('stale-b');
    expect(Object.keys(written.sessions)).toContain('active');
    expect(Object.keys(written.sessions)).toContain('new-session');
  });

  it('returns only the active-session count (excluding stale)', async () => {
    const now = 1_000_000_000_000;
    const sessions = {
      'stale': now - 200_000,
      'active': now - 40_000,
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ sessions }) as any);

    const req = makePostRequest({ sessionId: 'fresh-session' });
    const response = await POST(req);
    const data = await response.json();

    // active + fresh-session = 2; stale is pruned
    expect(data).toEqual({ count: 2 });
  });
});
