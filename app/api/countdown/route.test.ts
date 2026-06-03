// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockReadFile, mockWriteFile, mockMkdir } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockWriteFile: vi.fn(),
  mockMkdir: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
    mkdir: mockMkdir,
  },
}));

import { GET, POST } from './route';
import type { NextRequest } from 'next/server';

function makePostRequest(body: object): NextRequest {
  return { json: () => Promise.resolve(body) } as unknown as NextRequest;
}

describe('GET /api/countdown', () => {
  it('returns idle when data file is absent', async () => {
    mockReadFile.mockRejectedValueOnce(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ endsAt: null, status: 'idle' });
  });

  it('returns running when endsAt is in the future', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ endsAt: future }));
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe('running');
    expect(data.endsAt).toBe(future);
  });

  it('returns done when endsAt is in the past', async () => {
    const past = new Date(Date.now() - 5000).toISOString();
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ endsAt: past }));
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe('done');
    expect(data.endsAt).toBe(past);
  });

  it('returns idle when file contains null endsAt', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ endsAt: null }));
    const res = await GET();
    const data = await res.json();
    expect(data).toEqual({ endsAt: null, status: 'idle' });
  });
});

describe('POST /api/countdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
  });

  it('start with valid seconds returns running status', async () => {
    const req = makePostRequest({ action: 'start', seconds: 300 });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('running');
    expect(typeof data.endsAt).toBe('string');
    expect(mockMkdir).toHaveBeenCalledOnce();
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('start with seconds = 1 (boundary minimum) is accepted', async () => {
    const req = makePostRequest({ action: 'start', seconds: 1 });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('running');
  });

  it('start with seconds = 5999 (boundary maximum) is accepted', async () => {
    const req = makePostRequest({ action: 'start', seconds: 5999 });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('running');
  });

  it('start with seconds = 0 returns 400', async () => {
    const req = makePostRequest({ action: 'start', seconds: 0 });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/seconds/i);
  });

  it('start with seconds = 6000 (above maximum) returns 400', async () => {
    const req = makePostRequest({ action: 'start', seconds: 6000 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('start with non-integer seconds returns 400', async () => {
    const req = makePostRequest({ action: 'start', seconds: 1.5 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('start with missing seconds returns 400', async () => {
    const req = makePostRequest({ action: 'start' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('reset returns idle with null endsAt', async () => {
    const req = makePostRequest({ action: 'reset' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ endsAt: null, status: 'idle' });
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('reset persists null endsAt to the file', async () => {
    const req = makePostRequest({ action: 'reset' });
    await POST(req);
    const [, writtenContent] = mockWriteFile.mock.calls[0];
    expect(JSON.parse(writtenContent as string)).toEqual({ endsAt: null });
  });

  it('unknown action returns 400', async () => {
    const req = makePostRequest({ action: 'foobar' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/action/i);
  });

  it('start persists an ISO endsAt string to the file', async () => {
    const req = makePostRequest({ action: 'start', seconds: 60 });
    await POST(req);
    const [, writtenContent] = mockWriteFile.mock.calls[0];
    const parsed = JSON.parse(writtenContent as string);
    expect(typeof parsed.endsAt).toBe('string');
    // Should be approximately now + 60s
    const diff = new Date(parsed.endsAt).getTime() - Date.now();
    expect(diff).toBeGreaterThan(55_000);
    expect(diff).toBeLessThan(65_000);
  });
});
