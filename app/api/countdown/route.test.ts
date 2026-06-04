// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' })),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { readFile, writeFile } from 'node:fs/promises';
import { GET, POST } from './route';

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);

beforeEach(() => {
  mockReadFile.mockReset();
  mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
  mockWriteFile.mockReset();
  mockWriteFile.mockResolvedValue(undefined);
});

describe('GET /api/countdown', () => {
  it('returns idle when no file exists', async () => {
    const res = await GET();
    expect(await res.json()).toEqual({ state: 'idle' });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('returns stored idle state', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ state: 'idle' }));
    const res = await GET();
    expect(await res.json()).toEqual({ state: 'idle' });
  });

  it('returns running state when endsAt is in the future', async () => {
    const endsAt = Date.now() + 60_000;
    mockReadFile.mockResolvedValue(JSON.stringify({ state: 'running', endsAt }));
    const res = await GET();
    expect(await res.json()).toEqual({ state: 'running', endsAt });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('auto-transitions to finished when endsAt has passed', async () => {
    const endsAt = Date.now() - 1_000;
    mockReadFile.mockResolvedValue(JSON.stringify({ state: 'running', endsAt }));
    const res = await GET();
    expect(await res.json()).toEqual({ state: 'finished' });
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('returns finished state as-is without writing', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ state: 'finished' }));
    const res = await GET();
    expect(await res.json()).toEqual({ state: 'finished' });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});

function makePostReq(body: unknown): Request {
  return { json: async () => body } as Request;
}

describe('POST /api/countdown', () => {
  it('reset writes idle and returns it', async () => {
    const res = await POST(makePostReq({ action: 'reset' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ state: 'idle' });
    expect(mockWriteFile).toHaveBeenCalledOnce();
  });

  it('start with valid durationMs returns running state with correct endsAt', async () => {
    const before = Date.now();
    const res = await POST(makePostReq({ action: 'start', durationMs: 60_000 }));
    const after = Date.now();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.state).toBe('running');
    expect(data.endsAt).toBeGreaterThanOrEqual(before + 60_000);
    expect(data.endsAt).toBeLessThanOrEqual(after + 60_000);
  });

  it('start persists the running state to disk', async () => {
    await POST(makePostReq({ action: 'start', durationMs: 30_000 }));
    expect(mockWriteFile).toHaveBeenCalledOnce();
    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written.state).toBe('running');
    expect(typeof written.endsAt).toBe('number');
  });

  it('start with minimum valid durationMs (1 000 ms) succeeds', async () => {
    const res = await POST(makePostReq({ action: 'start', durationMs: 1_000 }));
    expect(res.status).toBe(200);
  });

  it('start with maximum valid durationMs (5 999 000 ms) succeeds', async () => {
    const res = await POST(makePostReq({ action: 'start', durationMs: 5_999_000 }));
    expect(res.status).toBe(200);
  });

  it('rejects durationMs = 0', async () => {
    const res = await POST(makePostReq({ action: 'start', durationMs: 0 }));
    expect(res.status).toBe(400);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('rejects durationMs just below minimum (999 ms)', async () => {
    const res = await POST(makePostReq({ action: 'start', durationMs: 999 }));
    expect(res.status).toBe(400);
  });

  it('rejects durationMs just above maximum (6 000 000 ms)', async () => {
    const res = await POST(makePostReq({ action: 'start', durationMs: 6_000_000 }));
    expect(res.status).toBe(400);
  });

  it('rejects non-integer durationMs', async () => {
    const res = await POST(makePostReq({ action: 'start', durationMs: 1_500.5 }));
    expect(res.status).toBe(400);
  });

  it('rejects unknown action', async () => {
    const res = await POST(makePostReq({ action: 'unknown' }));
    expect(res.status).toBe(400);
  });
});
