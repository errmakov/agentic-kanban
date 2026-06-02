import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('fs/promises', () => {
  const readFile = vi.fn();
  const writeFile = vi.fn();
  const mkdir = vi.fn();
  return { default: { readFile, writeFile, mkdir }, readFile, writeFile, mkdir };
});

import { GET, POST } from './route';
import { readFile, writeFile, mkdir } from 'fs/promises';

function makePostRequest(body: unknown): Request {
  return new Request('http://localhost/api/reactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/reactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns zeroed counts for all four emojis when the data file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
    );

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ '👍': 0, '❤️': 0, '🎉': 0, '🤔': 0 });
  });

  it('returns existing counts when the data file exists', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ '👍': 5, '❤️': 2, '🎉': 1, '🤔': 3 }) as any,
    );

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ '👍': 5, '❤️': 2, '🎉': 1, '🤔': 3 });
  });

  it('creates the data directory and initialises the file on first boot', async () => {
    vi.mocked(readFile).mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
    );

    await GET();

    expect(vi.mocked(mkdir)).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    const writtenContent = vi.mocked(writeFile).mock.calls[0][1] as string;
    expect(JSON.parse(writtenContent)).toEqual({ '👍': 0, '❤️': 0, '🎉': 0, '🤔': 0 });
  });
});

describe('POST /api/reactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('increments the count for a valid emoji and returns updated counts', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ '👍': 2, '❤️': 0, '🎉': 0, '🤔': 0 }) as any,
    );

    const response = await POST(makePostRequest({ emoji: '👍' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data['👍']).toBe(3);
    expect(data['❤️']).toBe(0);
  });

  it('persists the updated counts to disk', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ '👍': 0, '❤️': 0, '🎉': 0, '🤔': 0 }) as any,
    );

    await POST(makePostRequest({ emoji: '🎉' }));

    const postWriteCall = vi.mocked(writeFile).mock.calls.find(
      ([filePath]) => (filePath as string).includes('reactions.json'),
    );
    expect(postWriteCall).toBeDefined();
    const saved = JSON.parse(postWriteCall![1] as string);
    expect(saved['🎉']).toBe(1);
  });

  it('returns 400 for an emoji not in the allowed set', async () => {
    const response = await POST(makePostRequest({ emoji: '🦊' }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'invalid emoji' });
  });

  it('returns 400 when the emoji field is missing from the body', async () => {
    const response = await POST(makePostRequest({}));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'invalid emoji' });
  });

  it('initialises a missing count to zero before incrementing', async () => {
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ '👍': 0, '❤️': 0, '🎉': 0 }) as any,
    );

    const response = await POST(makePostRequest({ emoji: '🤔' }));
    const data = await response.json();

    expect(data['🤔']).toBe(1);
  });
});
