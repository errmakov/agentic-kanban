// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { readFile, writeFile } from 'fs/promises';
import { GET, POST } from './route';

const mockReadFile = readFile as unknown as ReturnType<typeof vi.fn>;
const mockWriteFile = writeFile as unknown as ReturnType<typeof vi.fn>;

describe('GET /api/countdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteFile.mockResolvedValue(undefined);
  });

  it('returns idle state when no countdown.json exists', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ status: 'idle', endsAt: null, totalSeconds: 0 });
  });

  it('returns running state when timer is active and not expired', async () => {
    const future = new Date(Date.now() + 30000).toISOString();
    mockReadFile.mockResolvedValue(
      JSON.stringify({ status: 'running', endsAt: future, totalSeconds: 60 }),
    );
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe('running');
    expect(data.endsAt).toBe(future);
  });

  it('lazily flips to finished when running but endsAt is in the past', async () => {
    const past = new Date(Date.now() - 5000).toISOString();
    mockReadFile.mockResolvedValue(
      JSON.stringify({ status: 'running', endsAt: past, totalSeconds: 60 }),
    );
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe('finished');
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it('returns finished state as-is without rewriting the file', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ status: 'finished', endsAt: null, totalSeconds: 60 }),
    );
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe('finished');
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('returns idle state as-is', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ status: 'idle', endsAt: null, totalSeconds: 0 }),
    );
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual({ status: 'idle', endsAt: null, totalSeconds: 0 });
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});

describe('POST /api/countdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteFile.mockResolvedValue(undefined);
  });

  function makeRequest(body: object) {
    return new Request('http://localhost/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('starts a timer with a valid duration', async () => {
    const request = makeRequest({ action: 'start', durationSeconds: 60 });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('running');
    expect(data.totalSeconds).toBe(60);
    expect(data.endsAt).toBeTruthy();
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it('accepts the maximum valid duration (5999 = 99:59)', async () => {
    const request = makeRequest({ action: 'start', durationSeconds: 5999 });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.totalSeconds).toBe(5999);
    expect(data.status).toBe('running');
  });

  it('accepts the minimum valid duration (1 second)', async () => {
    const request = makeRequest({ action: 'start', durationSeconds: 1 });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.totalSeconds).toBe(1);
  });

  it('returns 400 when durationSeconds is 0', async () => {
    const request = makeRequest({ action: 'start', durationSeconds: 0 });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('returns 400 when durationSeconds exceeds 5999', async () => {
    const request = makeRequest({ action: 'start', durationSeconds: 6000 });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for a non-integer durationSeconds', async () => {
    const request = makeRequest({ action: 'start', durationSeconds: 1.5 });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for a negative durationSeconds', async () => {
    const request = makeRequest({ action: 'start', durationSeconds: -1 });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('resets the timer to idle state', async () => {
    const request = makeRequest({ action: 'reset' });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ status: 'idle', endsAt: null, totalSeconds: 0 });
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it('returns 400 for an unknown action', async () => {
    const request = makeRequest({ action: 'pause' });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for a malformed (non-JSON) body', async () => {
    const request = new Request('http://localhost/api/countdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-{',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
