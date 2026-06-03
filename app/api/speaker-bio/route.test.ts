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

describe('GET /api/speaker-bio', () => {
  it('returns an empty votes map when the data file does not exist', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({});
  });

  it('returns persisted votes from the file', async () => {
    const votes = { 'alex-rivera': { up: 3, down: 1 }, 'priya-nair': { up: 5, down: 0 } };
    mockFs.readFile.mockResolvedValue(JSON.stringify({ votes }));
    const res = await GET();
    expect(await res.json()).toEqual(votes);
  });

  it('re-throws non-ENOENT file errors', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('EACCES'), { code: 'EACCES' }));
    await expect(GET()).rejects.toThrow('EACCES');
  });
});

describe('POST /api/speaker-bio', () => {
  it('returns 400 when vote is neither "up" nor "down"', async () => {
    const req = makeRequest({ speakerId: 'alex-rivera', vote: 'sideways' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty('error');
  });

  it('returns 400 for an empty vote string', async () => {
    const req = makeRequest({ speakerId: 'alex-rivera', vote: '' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('initializes a new speaker to zeros and increments up', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const req = makeRequest({ speakerId: 'brand-new-speaker', vote: 'up' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect((await res.json())['brand-new-speaker']).toEqual({ up: 1, down: 0 });
  });

  it('initializes a new speaker to zeros and increments down', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const req = makeRequest({ speakerId: 'another-speaker', vote: 'down' });
    const res = await POST(req);
    expect((await res.json())['another-speaker']).toEqual({ up: 0, down: 1 });
  });

  it('increments the up tally for an existing speaker', async () => {
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({ votes: { 'alex-rivera': { up: 4, down: 1 } } }),
    );
    const req = makeRequest({ speakerId: 'alex-rivera', vote: 'up' });
    const res = await POST(req);
    expect((await res.json())['alex-rivera']).toEqual({ up: 5, down: 1 });
  });

  it('increments the down tally for an existing speaker', async () => {
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({ votes: { 'priya-nair': { up: 2, down: 3 } } }),
    );
    const req = makeRequest({ speakerId: 'priya-nair', vote: 'down' });
    const res = await POST(req);
    expect((await res.json())['priya-nair']).toEqual({ up: 2, down: 4 });
  });

  it('preserves tallies of other speakers when incrementing one', async () => {
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({
        votes: {
          'alex-rivera': { up: 2, down: 0 },
          'priya-nair': { up: 1, down: 1 },
        },
      }),
    );
    const req = makeRequest({ speakerId: 'alex-rivera', vote: 'up' });
    const data = await (await POST(req)).json();
    expect(data['alex-rivera']).toEqual({ up: 3, down: 0 });
    expect(data['priya-nair']).toEqual({ up: 1, down: 1 });
  });

  it('persists updated votes to disk', async () => {
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({ votes: { 'sam-okonkwo': { up: 0, down: 0 } } }),
    );
    const req = makeRequest({ speakerId: 'sam-okonkwo', vote: 'up' });
    await POST(req);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mockFs.writeFile).toHaveBeenCalledOnce();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const written = JSON.parse((mockFs.writeFile as any).mock.calls[0][1] as string);
    expect(written.votes['sam-okonkwo']).toEqual({ up: 1, down: 0 });
  });

  it('creates the data directory before writing', async () => {
    mockFs.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const req = makeRequest({ speakerId: 'maya-chen', vote: 'up' });
    await POST(req);
    expect(mockFs.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('returns all tallies in the response, not just the updated speaker', async () => {
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({
        votes: {
          'alex-rivera': { up: 1, down: 0 },
          'priya-nair': { up: 2, down: 1 },
        },
      }),
    );
    const req = makeRequest({ speakerId: 'alex-rivera', vote: 'down' });
    const data = await (await POST(req)).json();
    expect(data['alex-rivera']).toEqual({ up: 1, down: 1 });
    expect(data['priya-nair']).toEqual({ up: 2, down: 1 });
  });
});
