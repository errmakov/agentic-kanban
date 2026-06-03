// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises');

import fs from 'fs/promises';
import { GET, POST } from './route';
import type { NextRequest } from 'next/server';

const mockFs = vi.mocked(fs);

function makeRequest(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFs.mkdir.mockResolvedValue(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockFs.writeFile as any).mockResolvedValue(undefined);
});

describe('GET /api/emoji-reactions', () => {
  it('returns empty counts when data file does not exist', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({ counts: {} });
  });

  it('returns persisted counts from file', async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({ counts: { '👍': 5, '🔥': 2 } }));
    const res = await GET();
    const data = await res.json();
    expect(data).toEqual({ counts: { '👍': 5, '🔥': 2 } });
  });

  it('returns empty counts when file contains corrupt JSON', async () => {
    mockFs.readFile.mockResolvedValue('not-valid-json{{{');
    const res = await GET();
    const data = await res.json();
    expect(data).toEqual({ counts: {} });
  });
});

describe('POST /api/emoji-reactions', () => {
  it('returns 400 for an emoji not in the allowed set', async () => {
    const req = makeRequest({ emoji: '🍕' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('increments count from 0 when file is missing', async () => {
    mockFs.readFile.mockRejectedValue(new Error('ENOENT'));
    const req = makeRequest({ emoji: '👍' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.counts['👍']).toBe(1);
  });

  it('increments an existing count', async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({ counts: { '👍': 3, '❤️': 1 } }));
    const req = makeRequest({ emoji: '👍' });
    const res = await POST(req);
    const data = await res.json();
    expect(data.counts['👍']).toBe(4);
    expect(data.counts['❤️']).toBe(1);
  });

  it('treats corrupt JSON as empty and increments from 0', async () => {
    mockFs.readFile.mockResolvedValue('not-valid-json');
    const req = makeRequest({ emoji: '🔥' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.counts['🔥']).toBe(1);
  });

  it('persists updated counts to disk', async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify({ counts: { '👍': 1 } }));
    const req = makeRequest({ emoji: '👍' });
    await POST(req);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((mockFs.writeFile as any)).toHaveBeenCalledOnce();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const written = JSON.parse((mockFs.writeFile as any).mock.calls[0][1] as string);
    expect(written.counts['👍']).toBe(2);
  });

  it('returns all emoji counts in the response after increment', async () => {
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({ counts: { '👍': 1, '❤️': 2, '🔥': 0, '🤔': 0, '👏': 0 } }),
    );
    const req = makeRequest({ emoji: '❤️' });
    const res = await POST(req);
    const data = await res.json();
    expect(data.counts['❤️']).toBe(3);
    expect(data.counts['👍']).toBe(1);
  });
});
