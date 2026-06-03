// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { GET, POST } from './route';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const zeroed = { '👍': 0, '❤️': 0, '😂': 0, '🎉': 0, '🔥': 0 };
const stored = { '👍': 3, '❤️': 1, '😂': 0, '🎉': 0, '🔥': 0 };

function makePostRequest(body: unknown) {
  return new Request('http://localhost/api/emoji-reactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/emoji-reactions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns zeroed counts when data file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(zeroed);
  });

  it('returns stored counts when data file exists', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(stored) as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(stored);
  });

  it('backfills missing emoji keys from a stale data file', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ '👍': 10 }) as never);

    const response = await GET();
    const data = await response.json();

    expect(data['👍']).toBe(10);
    expect(data['❤️']).toBe(0);
    expect(data['😂']).toBe(0);
    expect(data['🎉']).toBe(0);
    expect(data['🔥']).toBe(0);
  });

  it('ensures the data directory exists before reading', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    await GET();

    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });
});

describe('POST /api/emoji-reactions', () => {
  beforeEach(() => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(stored) as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when emoji field is missing from body', async () => {
    const response = await POST(makePostRequest({}));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('invalid emoji');
  });

  it('returns 400 when emoji is not in the allowed set', async () => {
    const response = await POST(makePostRequest({ emoji: '🦄' }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('invalid emoji');
  });

  it('returns 400 when request body is malformed JSON', async () => {
    const badRequest = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: 'not-valid-json',
    });

    const response = await POST(badRequest);
    expect(response.status).toBe(400);
  });

  it('returns 200 with incremented count for a valid emoji', async () => {
    const response = await POST(makePostRequest({ emoji: '👍' }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data['👍']).toBe(4);
  });

  it('returns all emoji counts in the response', async () => {
    const response = await POST(makePostRequest({ emoji: '🔥' }));
    const data = await response.json();

    expect(data).toEqual({ '👍': 3, '❤️': 1, '😂': 0, '🎉': 0, '🔥': 1 });
  });

  it('persists the updated counts to disk', async () => {
    await POST(makePostRequest({ emoji: '❤️' }));

    expect(writeFile).toHaveBeenCalledOnce();
    const [, content] = vi.mocked(writeFile).mock.calls[0];
    const written = JSON.parse(content as string);
    expect(written['❤️']).toBe(2);
  });

  it('ensures the data directory exists before writing', async () => {
    await POST(makePostRequest({ emoji: '😂' }));

    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });
});
