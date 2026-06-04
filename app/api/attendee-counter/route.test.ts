// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted() ensures these vi.fn() instances are available when the vi.mock factory runs
const { mockReadFile, mockWriteFile, mockMkdir } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockWriteFile: vi.fn(() => Promise.resolve()),
  mockMkdir: vi.fn(() => Promise.resolve()),
}));

vi.mock('node:fs/promises', () => ({
  default: { readFile: mockReadFile, writeFile: mockWriteFile, mkdir: mockMkdir },
  readFile: mockReadFile,
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
}));

const { GET, POST } = await import('./route');

// Simple stub that avoids native Request implementation details
function makePostRequest(body: unknown): Request {
  return { json: () => Promise.resolve(body) } as unknown as Request;
}

describe('GET /api/attendee-counter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns count 0 when the data file does not exist yet', async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const res = await GET();
    expect(await res.json()).toEqual({ count: 0 });
  });

  it('counts only sessions with heartbeats within the last 30 s', async () => {
    const now = Date.now();
    mockReadFile.mockResolvedValue(
      JSON.stringify({
        active1: now - 1_000,  // 1 s ago — active
        active2: now - 29_000, // 29 s ago — active
        stale: now - 31_000,   // 31 s ago — outside 30 s window
      }),
    );
    const res = await GET();
    expect(await res.json()).toEqual({ count: 2 });
  });

  it('returns count 0 when all sessions are stale', async () => {
    const now = Date.now();
    mockReadFile.mockResolvedValue(
      JSON.stringify({ s1: now - 60_000, s2: now - 90_000 }),
    );
    const res = await GET();
    expect(await res.json()).toEqual({ count: 0 });
  });

  it('counts all sessions when all heartbeats are fresh', async () => {
    const now = Date.now();
    mockReadFile.mockResolvedValue(
      JSON.stringify({ s1: now - 5_000, s2: now - 10_000, s3: now }),
    );
    const res = await GET();
    expect(await res.json()).toEqual({ count: 3 });
  });
});

describe('POST /api/attendee-counter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
  });

  it('returns 400 when sessionId is missing from the body', async () => {
    const res = await POST(makePostRequest({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'sessionId is required' });
  });

  it('returns { ok: true } and writes the file on a valid heartbeat', async () => {
    const res = await POST(makePostRequest({ sessionId: 'sess-001' }));
    expect(await res.json()).toEqual({ ok: true });
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('records the sessionId with a recent timestamp', async () => {
    const before = Date.now();
    await POST(makePostRequest({ sessionId: 'sess-002' }));
    const after = Date.now();
    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written['sess-002']).toBeGreaterThanOrEqual(before);
    expect(written['sess-002']).toBeLessThanOrEqual(after);
  });

  it('prunes sessions older than 60 s', async () => {
    const now = Date.now();
    mockReadFile.mockResolvedValue(
      JSON.stringify({ 'old-session': now - 61_000 }),
    );
    await POST(makePostRequest({ sessionId: 'new-session' }));
    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written['old-session']).toBeUndefined();
    expect(written['new-session']).toBeTypeOf('number');
  });

  it('retains sessions within the 60 s prune window', async () => {
    const now = Date.now();
    const keepTime = now - 30_000;
    mockReadFile.mockResolvedValue(
      JSON.stringify({ 'keep-session': keepTime }),
    );
    await POST(makePostRequest({ sessionId: 'new-session' }));
    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written['keep-session']).toBe(keepTime);
    expect(written['new-session']).toBeTypeOf('number');
  });

  it('creates the data directory before writing', async () => {
    await POST(makePostRequest({ sessionId: 'sess-003' }));
    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('updates an existing session with a fresh timestamp', async () => {
    const now = Date.now();
    const oldTime = now - 15_000;
    mockReadFile.mockResolvedValue(
      JSON.stringify({ 'existing-session': oldTime }),
    );
    await POST(makePostRequest({ sessionId: 'existing-session' }));
    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written['existing-session']).toBeGreaterThan(oldTime);
  });
});
