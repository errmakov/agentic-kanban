// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn(),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}));

import { GET, POST, EMOJIS } from './route';
import { promises as fs } from 'fs';

const enoent = () => {
  const err = new Error('ENOENT') as NodeJS.ErrnoException;
  err.code = 'ENOENT';
  return err;
};

const makePostRequest = (body: unknown) =>
  new Request('http://localhost/api/reactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('GET /api/reactions', () => {
  beforeEach(() => {
    vi.mocked(fs.readFile).mockRejectedValue(enoent());
  });

  it('returns all emojis defaulting to 0 when no file exists', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(Object.fromEntries(EMOJIS.map((e) => [e, 0])));
  });

  it('always includes every emoji in the response even when file has partial counts', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ '👍': 7, '❤️': 3 }) as never);
    const res = await GET();
    const data = await res.json();
    expect(data['👍']).toBe(7);
    expect(data['❤️']).toBe(3);
    for (const emoji of EMOJIS) {
      expect(typeof data[emoji]).toBe('number');
    }
    expect(data['😂']).toBe(0);
    expect(data['🎉']).toBe(0);
    expect(data['🤯']).toBe(0);
  });
});

describe('POST /api/reactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockRejectedValue(enoent());
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('increments the emoji count and returns updated counts with all emojis', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ '👍': 4 }) as never);
    const res = await POST(makePostRequest({ emoji: '👍' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data['👍']).toBe(5);
    for (const emoji of EMOJIS) {
      expect(typeof data[emoji]).toBe('number');
    }
  });

  it('writes updated counts to the file', async () => {
    await POST(makePostRequest({ emoji: '🎉' }));
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalledOnce();
    const written = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
    expect(written['🎉']).toBe(1);
  });

  it('returns 400 for an emoji not in the fixed set', async () => {
    const res = await POST(makePostRequest({ emoji: '🔥' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('invalid emoji');
  });

  it('returns 400 when emoji is a non-string value', async () => {
    const res = await POST(makePostRequest({ emoji: 42 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('invalid emoji');
  });

  it('returns 400 when emoji field is missing', async () => {
    const res = await POST(makePostRequest({ other: 'field' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('invalid emoji');
  });

  it('returns 400 for a malformed request body', async () => {
    const req = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('invalid body');
  });
});
