import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockReadFile, mockWriteFile, mockMkdir } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockWriteFile: vi.fn(),
  mockMkdir: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: { readFile: mockReadFile, writeFile: mockWriteFile, mkdir: mockMkdir },
  readFile: mockReadFile,
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
}));

import { GET, POST } from './route';

function makePostRequest(body: object) {
  return new Request('http://localhost/api/countdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/countdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
  });

  it('returns idle state when the file does not exist', async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: 'idle', endsAt: null, durationMs: 0 });
  });

  it('returns running state when timer is still active', async () => {
    const endsAt = Date.now() + 60_000;
    mockReadFile.mockResolvedValue(JSON.stringify({ status: 'running', endsAt, durationMs: 60_000 }));
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe('running');
    expect(data.endsAt).toBe(endsAt);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('reconciles running to done when the timer has expired', async () => {
    const endsAt = Date.now() - 1000;
    mockReadFile.mockResolvedValue(JSON.stringify({ status: 'running', endsAt, durationMs: 60_000 }));
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe('done');
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('returns done state without reconciling', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ status: 'done', endsAt: 1, durationMs: 1000 }));
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe('done');
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});

describe('POST /api/countdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
  });

  it('start returns a running state with correct durationMs', async () => {
    const res = await POST(makePostRequest({ action: 'start', minutes: 1, seconds: 30 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('running');
    expect(data.durationMs).toBe(90_000);
    expect(data.endsAt).toBeGreaterThan(Date.now() - 1000);
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('start accepts boundary values: 99 minutes and 59 seconds', async () => {
    const res = await POST(makePostRequest({ action: 'start', minutes: 99, seconds: 59 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.durationMs).toBe((99 * 60 + 59) * 1000);
  });

  it('start accepts a minutes-only duration', async () => {
    const res = await POST(makePostRequest({ action: 'start', minutes: 5, seconds: 0 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.durationMs).toBe(300_000);
  });

  it('start returns 400 when both minutes and seconds are 0', async () => {
    const res = await POST(makePostRequest({ action: 'start', minutes: 0, seconds: 0 }));
    expect(res.status).toBe(400);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('start returns 400 when minutes exceeds 99', async () => {
    const res = await POST(makePostRequest({ action: 'start', minutes: 100, seconds: 0 }));
    expect(res.status).toBe(400);
  });

  it('start returns 400 when seconds exceeds 59', async () => {
    const res = await POST(makePostRequest({ action: 'start', minutes: 0, seconds: 60 }));
    expect(res.status).toBe(400);
  });

  it('start returns 400 for negative minutes', async () => {
    const res = await POST(makePostRequest({ action: 'start', minutes: -1, seconds: 30 }));
    expect(res.status).toBe(400);
  });

  it('start returns 400 for non-integer minutes', async () => {
    const res = await POST(makePostRequest({ action: 'start', minutes: 1.5, seconds: 0 }));
    expect(res.status).toBe(400);
  });

  it('reset writes idle state and returns it', async () => {
    const res = await POST(makePostRequest({ action: 'reset' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: 'idle', endsAt: null, durationMs: 0 });
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('returns 400 for an unknown action', async () => {
    const res = await POST(makePostRequest({ action: 'unknown' }));
    expect(res.status).toBe(400);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});
