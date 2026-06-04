import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs/promises', () => {
  const mkdir = vi.fn().mockResolvedValue(undefined);
  const readFile = vi.fn();
  const writeFile = vi.fn().mockResolvedValue(undefined);
  const mod = { mkdir, readFile, writeFile };
  return { ...mod, default: mod };
});

import { GET, POST } from './route';
import { readFile, writeFile } from 'node:fs/promises';

function makePostRequest(body: unknown): Request {
  return new Request('http://localhost/api/speaker-bio-cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/speaker-bio-cards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty object when the data file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({});
  });

  it('returns all tallies from the data file', async () => {
    const stored = { 'alice-mercer': { up: 5, down: 2 }, 'ben-ortiz': { up: 1, down: 0 } };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(stored));
    const response = await GET();
    const data = await response.json();
    expect(data).toEqual(stored);
  });
});

describe('POST /api/speaker-bio-cards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  it('returns 400 for invalid JSON body', async () => {
    const request = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json{{{',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when speakerId is missing', async () => {
    const response = await POST(makePostRequest({ direction: 'up' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when speakerId is not a string', async () => {
    const response = await POST(makePostRequest({ speakerId: 42, direction: 'up' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when direction is invalid', async () => {
    const response = await POST(makePostRequest({ speakerId: 'alice-mercer', direction: 'sideways' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when direction is missing', async () => {
    const response = await POST(makePostRequest({ speakerId: 'alice-mercer' }));
    expect(response.status).toBe(400);
  });

  it('returns 404 for an unknown speakerId', async () => {
    const response = await POST(makePostRequest({ speakerId: 'no-such-person', direction: 'up' }));
    expect(response.status).toBe(404);
  });

  it('increments the up tally and returns the updated entry', async () => {
    const existing = { 'alice-mercer': { up: 3, down: 1 } };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(existing));
    const response = await POST(makePostRequest({ speakerId: 'alice-mercer', direction: 'up' }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ up: 4, down: 1 });
  });

  it('increments the down tally and returns the updated entry', async () => {
    const existing = { 'alice-mercer': { up: 3, down: 1 } };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(existing));
    const response = await POST(makePostRequest({ speakerId: 'alice-mercer', direction: 'down' }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ up: 3, down: 2 });
  });

  it('initializes tallies at zero for a speaker voting for the first time', async () => {
    const response = await POST(makePostRequest({ speakerId: 'ben-ortiz', direction: 'up' }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ up: 1, down: 0 });
  });

  it('persists the updated tallies to the file', async () => {
    await POST(makePostRequest({ speakerId: 'chen-wei', direction: 'down' }));
    expect(vi.mocked(writeFile)).toHaveBeenCalledOnce();
    const written = vi.mocked(writeFile).mock.calls[0][1] as string;
    const parsed = JSON.parse(written);
    expect(parsed['chen-wei']).toEqual({ up: 0, down: 1 });
  });

  it('preserves existing tallies for other speakers when one votes', async () => {
    const existing = { 'alice-mercer': { up: 10, down: 3 } };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(existing));
    await POST(makePostRequest({ speakerId: 'ben-ortiz', direction: 'up' }));
    const written = vi.mocked(writeFile).mock.calls[0][1] as string;
    const parsed = JSON.parse(written);
    expect(parsed['alice-mercer']).toEqual({ up: 10, down: 3 });
    expect(parsed['ben-ortiz']).toEqual({ up: 1, down: 0 });
  });
});
