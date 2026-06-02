import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockMkdir = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockReadFile = vi.hoisted(() => vi.fn());
const mockWriteFile = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('fs/promises', () => ({
  default: {
    mkdir: mockMkdir,
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  },
  mkdir: mockMkdir,
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/presence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/presence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    mockWriteFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
  });

  it('returns 400 when id is missing from body', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/id/i);
  });

  it('returns 400 when id is an empty string', async () => {
    const res = await POST(makeRequest({ id: '' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/id/i);
  });

  it('returns 400 when id is not a string (number)', async () => {
    const res = await POST(makeRequest({ id: 123 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is malformed JSON', async () => {
    const req = new Request('http://localhost/api/presence', {
      method: 'POST',
      body: 'not-valid-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with count 1 when file is absent (first viewer)', async () => {
    const res = await POST(makeRequest({ id: 'viewer-1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(1);
  });

  it('ensures the data directory exists via mkdir', async () => {
    await POST(makeRequest({ id: 'viewer-1' }));
    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('writes the updated presence data to file', async () => {
    await POST(makeRequest({ id: 'viewer-1' }));
    expect(mockWriteFile).toHaveBeenCalledOnce();
    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written['viewer-1']).toBeTypeOf('number');
  });

  it('returns correct count when existing fresh entries are present', async () => {
    const now = Date.now();
    const existing = {
      'viewer-a': now - 10_000,
      'viewer-b': now - 20_000,
    };
    mockReadFile.mockResolvedValueOnce(JSON.stringify(existing));

    const res = await POST(makeRequest({ id: 'viewer-c' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(3);
  });

  it('prunes stale entries older than 60 seconds', async () => {
    const now = Date.now();
    const existing = {
      'fresh-viewer': now - 10_000,
      'stale-viewer': now - 70_000,
    };
    mockReadFile.mockResolvedValueOnce(JSON.stringify(existing));

    const res = await POST(makeRequest({ id: 'new-viewer' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    // stale-viewer is pruned; fresh-viewer + new-viewer = 2
    expect(body.count).toBe(2);

    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written['stale-viewer']).toBeUndefined();
    expect(written['fresh-viewer']).toBeDefined();
    expect(written['new-viewer']).toBeDefined();
  });

  it('counts only the current viewer when all existing entries are stale', async () => {
    const existing = { 'old-viewer': Date.now() - 90_000 };
    mockReadFile.mockResolvedValueOnce(JSON.stringify(existing));

    const res = await POST(makeRequest({ id: 'only-viewer' }));
    const body = await res.json();
    expect(body.count).toBe(1);
  });

  it('updates the timestamp when the same viewer id is seen again', async () => {
    const staleTime = Date.now() - 70_000;
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ 'viewer-1': staleTime }));

    const res = await POST(makeRequest({ id: 'viewer-1' }));
    const body = await res.json();
    // The re-posting refreshes the timestamp, so it's no longer stale
    expect(body.count).toBe(1);
    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written['viewer-1']).toBeGreaterThan(staleTime);
  });
});
