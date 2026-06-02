// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { readFile, mkdir, writeFile } from 'fs/promises';
import { GET, PUT } from './route';

const mockReadFile = vi.mocked(readFile);
const mockMkdir = vi.mocked(mkdir);
const mockWriteFile = vi.mocked(writeFile);

function makeRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

describe('GET /api/now-speaking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty session when data file does not exist', async () => {
    const err = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    mockReadFile.mockRejectedValue(err);
    const res = await GET();
    const data = await res.json();
    expect(data).toEqual({ session: '' });
    expect(res.status).toBe(200);
  });

  it('returns the stored session from file', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ session: 'Keynote' }) as never);
    const res = await GET();
    const data = await res.json();
    expect(data).toEqual({ session: 'Keynote' });
  });

  it('returns empty session when file contains non-string session', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ session: 99 }) as never);
    const res = await GET();
    const data = await res.json();
    expect(data).toEqual({ session: '' });
  });

  it('returns empty session when file contains malformed JSON', async () => {
    mockReadFile.mockResolvedValue('not-json' as never);
    const res = await GET();
    const data = await res.json();
    expect(data).toEqual({ session: '' });
  });
});

describe('PUT /api/now-speaking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes the session to disk and returns it', async () => {
    const res = await PUT(makeRequest({ session: 'Workshop A' }));
    const data = await res.json();
    expect(data).toEqual({ session: 'Workshop A' });
    expect(mockWriteFile).toHaveBeenCalledOnce();
    const written = JSON.parse((mockWriteFile.mock.calls[0][1] as string));
    expect(written).toEqual({ session: 'Workshop A' });
  });

  it('creates the data directory before writing', async () => {
    await PUT(makeRequest({ session: 'Workshop B' }));
    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(mockMkdir.mock.invocationCallOrder[0]).toBeLessThan(
      mockWriteFile.mock.invocationCallOrder[0],
    );
  });

  it('normalizes a non-string session to empty string', async () => {
    const res = await PUT(makeRequest({ session: 123 }));
    const data = await res.json();
    expect(data).toEqual({ session: '' });
    const written = JSON.parse((mockWriteFile.mock.calls[0][1] as string));
    expect(written).toEqual({ session: '' });
  });

  it('normalizes a missing session field to empty string', async () => {
    const res = await PUT(makeRequest({}));
    const data = await res.json();
    expect(data).toEqual({ session: '' });
  });
});
