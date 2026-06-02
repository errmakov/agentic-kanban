// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  },
}));

import { promises as mockFs } from 'fs';
import { GET, POST } from './route';

type AnyFn = (...args: unknown[]) => unknown;

function setupReadFile(state: unknown) {
  (mockFs.readFile as unknown as AnyFn & { mockResolvedValueOnce: AnyFn }).mockResolvedValueOnce(
    JSON.stringify(state),
  );
}

function setupReadFileNotFound() {
  const err = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
  (mockFs.readFile as unknown as AnyFn & { mockRejectedValueOnce: AnyFn }).mockRejectedValueOnce(err);
}

function postRequest(body: unknown) {
  return new Request('http://localhost/api/countdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  (mockFs.writeFile as unknown as AnyFn & { mockResolvedValue: AnyFn }).mockResolvedValue(undefined);
  (mockFs.mkdir as unknown as AnyFn & { mockResolvedValue: AnyFn }).mockResolvedValue(undefined);
  vi.clearAllMocks();
  (mockFs.writeFile as unknown as AnyFn & { mockResolvedValue: AnyFn }).mockResolvedValue(undefined);
  (mockFs.mkdir as unknown as AnyFn & { mockResolvedValue: AnyFn }).mockResolvedValue(undefined);
});

describe('GET /api/countdown', () => {
  it('returns idle when the file does not exist', async () => {
    setupReadFileNotFound();
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'idle', endsAt: null });
  });

  it('returns idle state stored in file', async () => {
    setupReadFile({ status: 'idle', endsAt: null });
    const res = await GET();
    expect(await res.json()).toEqual({ status: 'idle', endsAt: null });
  });

  it('returns running state when endsAt is in the future', async () => {
    const endsAt = Date.now() + 60_000;
    setupReadFile({ status: 'running', endsAt });
    const res = await GET();
    expect(await res.json()).toEqual({ status: 'running', endsAt });
  });

  it('lazily transitions running → finished when endsAt is in the past', async () => {
    const endsAt = Date.now() - 5_000;
    setupReadFile({ status: 'running', endsAt });
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe('finished');
    expect(data.endsAt).toBe(endsAt);
    expect(mockFs.writeFile).toHaveBeenCalled();
  });

  it('returns finished state as-is without re-writing', async () => {
    const endsAt = Date.now() - 1_000;
    setupReadFile({ status: 'finished', endsAt });
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe('finished');
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });
});

describe('POST /api/countdown', () => {
  it('reset writes idle state and returns it', async () => {
    const res = await POST(postRequest({ action: 'reset' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'idle', endsAt: null });
    expect(mockFs.writeFile).toHaveBeenCalled();
  });

  it('start with valid durationSeconds returns running state', async () => {
    const before = Date.now();
    const res = await POST(postRequest({ action: 'start', durationSeconds: 300 }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe('running');
    expect(data.endsAt).toBeGreaterThanOrEqual(before + 300_000);
  });

  it('start writes running state to file', async () => {
    await POST(postRequest({ action: 'start', durationSeconds: 60 }));
    expect(mockFs.mkdir).toHaveBeenCalled();
    expect(mockFs.writeFile).toHaveBeenCalled();
    const writtenJson = (mockFs.writeFile as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][1] as string;
    expect(JSON.parse(writtenJson).status).toBe('running');
  });

  it('start with durationSeconds = 1 succeeds (lower boundary)', async () => {
    const res = await POST(postRequest({ action: 'start', durationSeconds: 1 }));
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('running');
  });

  it('start with durationSeconds = 5999 succeeds (upper boundary)', async () => {
    const res = await POST(postRequest({ action: 'start', durationSeconds: 5999 }));
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('running');
  });

  it('start with durationSeconds = 0 returns 400', async () => {
    const res = await POST(postRequest({ action: 'start', durationSeconds: 0 }));
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty('error');
  });

  it('start with durationSeconds = 6000 returns 400', async () => {
    const res = await POST(postRequest({ action: 'start', durationSeconds: 6000 }));
    expect(res.status).toBe(400);
  });

  it('start with non-integer durationSeconds returns 400', async () => {
    const res = await POST(postRequest({ action: 'start', durationSeconds: 1.5 }));
    expect(res.status).toBe(400);
  });

  it('start with missing durationSeconds returns 400', async () => {
    const res = await POST(postRequest({ action: 'start' }));
    expect(res.status).toBe(400);
  });

  it('unknown action returns 400 with error message', async () => {
    const res = await POST(postRequest({ action: 'pause' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Unknown action' });
  });

  it('invalid JSON body returns 400', async () => {
    const req = new Request('http://localhost/api/countdown', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty('error', 'Invalid JSON body');
  });
});
