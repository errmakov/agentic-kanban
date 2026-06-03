import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

const { mockReadFile, mockMkdir, mockWriteFile } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockMkdir: vi.fn(),
  mockWriteFile: vi.fn(),
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  const promisesMock = {
    ...actual.promises,
    readFile: mockReadFile,
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
  };
  return {
    ...actual,
    default: { ...actual, promises: promisesMock },
    promises: promisesMock,
  };
});

import { POST, GET } from './route';

function makePostRequest(body: unknown): Request {
  return new Request('http://localhost/api/attendee-counter', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/attendee-counter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
  });

  it('returns 400 when sessionId is missing from body', async () => {
    const res = await POST(makePostRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toBeDefined();
  });

  it('returns 400 when sessionId is an empty string', async () => {
    const res = await POST(makePostRequest({ sessionId: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when sessionId is not a string', async () => {
    const res = await POST(makePostRequest({ sessionId: 123 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when request body is invalid JSON', async () => {
    const res = await POST(makePostRequest('not-json'));
    expect(res.status).toBe(400);
  });

  it('records the heartbeat and returns count of 1 for a fresh session', async () => {
    const res = await POST(makePostRequest({ sessionId: 'session-abc' }));
    expect(res.status).toBe(200);
    const data = await res.json() as { count: number };
    expect(data.count).toBe(1);
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('creates the data directory before writing', async () => {
    await POST(makePostRequest({ sessionId: 'session-abc' }));
    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('prunes stale sessions and counts only the new active one', async () => {
    const staleTs = Date.now() - 35_000;
    mockReadFile.mockResolvedValue(
      JSON.stringify({ sessions: { 'stale-session': staleTs } }),
    );
    const res = await POST(makePostRequest({ sessionId: 'fresh-session' }));
    const data = await res.json() as { count: number };
    expect(data.count).toBe(1);
  });

  it('counts all currently active sessions including the new one', async () => {
    const now = Date.now();
    mockReadFile.mockResolvedValue(
      JSON.stringify({ sessions: { 'existing-active': now - 5_000 } }),
    );
    const res = await POST(makePostRequest({ sessionId: 'new-session' }));
    const data = await res.json() as { count: number };
    expect(data.count).toBe(2);
  });

  it('writes a JSON file with the updated session map', async () => {
    await POST(makePostRequest({ sessionId: 'session-write-test' }));
    expect(mockWriteFile).toHaveBeenCalledOnce();
    const [, written] = mockWriteFile.mock.calls[0] as [unknown, string];
    const stored = JSON.parse(written) as { sessions: Record<string, number> };
    expect(stored.sessions['session-write-test']).toBeGreaterThan(0);
  });
});

describe('GET /api/attendee-counter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
  });

  it('returns count of 0 when no sessions file exists', async () => {
    const res = await GET();
    const data = await res.json() as { count: number };
    expect(data.count).toBe(0);
  });

  it('returns count of active sessions, excluding stale ones', async () => {
    const now = Date.now();
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        sessions: {
          'active-1': now - 5_000,
          'active-2': now - 10_000,
          'stale-1': now - 35_000,
        },
      }),
    );
    const res = await GET();
    const data = await res.json() as { count: number };
    expect(data.count).toBe(2);
  });

  it('does not write or modify the store', async () => {
    await GET();
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});
