// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import { mkdir, readFile, writeFile } from 'fs/promises';
import { GET, POST, EMOJIS } from './route';

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockMkdir = vi.mocked(mkdir);

const allZero = Object.fromEntries(EMOJIS.map((e) => [e, 0]));

function makePost(body: unknown): Request {
  return new Request('http://localhost/api/emoji-reactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mockMkdir.mockResolvedValue(undefined);
  mockWriteFile.mockResolvedValue(undefined);
});

describe('GET /api/emoji-reactions', () => {
  it('returns all-zero counts when the data file does not exist', async () => {
    mockReadFile.mockRejectedValue(
      Object.assign(new Error('ENOENT: no such file'), { code: 'ENOENT' }),
    );

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    for (const emoji of EMOJIS) {
      expect(body[emoji]).toBe(0);
    }
  });

  it('returns persisted counts when the data file exists', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ '👍': 7, '🔥': 3, '❤️': 1, '😂': 0, '🚀': 0 }) as any,
    );

    const res = await GET();
    const body = await res.json();

    expect(body['👍']).toBe(7);
    expect(body['🔥']).toBe(3);
    expect(body['❤️']).toBe(1);
  });

  it('fills in missing emojis with 0 when only partial data is stored', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ '👍': 10 }) as any);

    const res = await GET();
    const body = await res.json();

    expect(body['👍']).toBe(10);
    expect(body['🔥']).toBe(0);
    expect(body['❤️']).toBe(0);
    expect(body['😂']).toBe(0);
    expect(body['🚀']).toBe(0);
  });
});

describe('POST /api/emoji-reactions', () => {
  beforeEach(() => {
    mockReadFile.mockResolvedValue(JSON.stringify(allZero) as any);
  });

  it('increments a valid emoji and returns updated counts', async () => {
    const res = await POST(makePost({ emoji: '👍' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body['👍']).toBe(1);
    expect(body['🔥']).toBe(0);
  });

  it('writes the incremented count to disk', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ ...allZero, '🔥': 4 }) as any);

    await POST(makePost({ emoji: '🔥' }));

    expect(mockWriteFile).toHaveBeenCalledOnce();
    const [, written] = mockWriteFile.mock.calls[0] as [string, string, string];
    expect(JSON.parse(written)['🔥']).toBe(5);
  });

  it('creates the data directory before writing', async () => {
    await POST(makePost({ emoji: '🚀' }));
    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('returns 400 for an unknown emoji', async () => {
    const res = await POST(makePost({ emoji: '🎉' }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid emoji');
  });

  it('returns 400 when the emoji field is absent', async () => {
    const res = await POST(makePost({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for a malformed JSON body', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: 'not json at all',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('does not write to disk when the emoji is invalid', async () => {
    await POST(makePost({ emoji: '💩' }));
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});
