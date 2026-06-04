// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { readFile, writeFile } from 'fs/promises';
import { GET, POST } from './route';

const ZEROED = { '👏': 0, '🔥': 0, '🤔': 0, '💡': 0 };

function makePost(body: unknown) {
  return new Request('http://localhost/api/emoji-reactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/emoji-reactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns zeroed counts when the data file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(ZEROED);
  });

  it('returns stored counts when the file exists', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ '👏': 5, '🔥': 3, '🤔': 1, '💡': 2 }) as unknown as Buffer,
    );
    const res = await GET();
    expect(await res.json()).toEqual({ '👏': 5, '🔥': 3, '🤔': 1, '💡': 2 });
  });

  it('falls back to zeroed counts when file contains invalid JSON', async () => {
    vi.mocked(readFile).mockResolvedValue('not-valid-json' as unknown as Buffer);
    const res = await GET();
    expect(await res.json()).toEqual(ZEROED);
  });

  it('defaults missing emoji keys to 0 and ignores unknown keys', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ '👏': 9, unknownEmoji: 99 }) as unknown as Buffer,
    );
    const res = await GET();
    const data = await res.json();
    expect(data['👏']).toBe(9);
    expect(data['🔥']).toBe(0);
    expect(data).not.toHaveProperty('unknownEmoji');
  });
});

describe('POST /api/emoji-reactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(ZEROED) as unknown as Buffer);
  });

  it('increments count for a valid emoji and returns updated counts', async () => {
    const res = await POST(makePost({ emoji: '👏' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data['👏']).toBe(1);
    expect(data['🔥']).toBe(0);
  });

  it('writes the updated counts to disk', async () => {
    await POST(makePost({ emoji: '🔥' }));
    expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
      expect.stringContaining('emoji-reactions.json'),
      expect.stringContaining('"🔥":1'),
      'utf8',
    );
  });

  it('returns 400 for an emoji not in the allowed list', async () => {
    const res = await POST(makePost({ emoji: '😀' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid emoji');
  });

  it('returns 400 when emoji field is missing from body', async () => {
    const res = await POST(makePost({ notEmoji: '👏' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-string emoji value', async () => {
    const res = await POST(makePost({ emoji: 42 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid emoji');
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid body');
  });

  it('does not write to disk on invalid emoji', async () => {
    await POST(makePost({ emoji: '💩' }));
    expect(vi.mocked(writeFile)).not.toHaveBeenCalled();
  });
});
