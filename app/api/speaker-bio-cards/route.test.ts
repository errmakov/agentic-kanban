import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promises as fs } from 'node:fs';

vi.mock('node:fs', () => {
  const promises = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  };
  return { default: { promises }, promises };
});

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(data),
    })),
  },
}));

import { GET, POST } from './route';

function makePostRequest(body: unknown) {
  return new Request('http://localhost/api/speaker-bio-cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/speaker-bio-cards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.readFile).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined as never);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
  });

  it('returns 200 with zero tallies for all speakers when no file exists', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({
      'ada-lovelace': { up: 0, down: 0 },
      'grace-hopper': { up: 0, down: 0 },
      'alan-turing': { up: 0, down: 0 },
    });
  });

  it('returns persisted tallies merged with zero defaults for missing speakers', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify({ 'ada-lovelace': { up: 5, down: 2 } }) as never,
    );
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data['ada-lovelace']).toEqual({ up: 5, down: 2 });
    expect(data['grace-hopper']).toEqual({ up: 0, down: 0 });
    expect(data['alan-turing']).toEqual({ up: 0, down: 0 });
  });

  it('returns all three known speaker ids', async () => {
    const response = await GET();
    const data = await response.json();
    expect(Object.keys(data).sort()).toEqual(['ada-lovelace', 'alan-turing', 'grace-hopper']);
  });
});

describe('POST /api/speaker-bio-cards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.readFile).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined as never);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
  });

  it('increments the up count and returns the updated tally', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify({ 'ada-lovelace': { up: 3, down: 1 } }) as never,
    );
    const response = await POST(makePostRequest({ speakerId: 'ada-lovelace', vote: 'up' }));
    const tally = await response.json();
    expect(response.status).toBe(200);
    expect(tally).toEqual({ up: 4, down: 1 });
  });

  it('increments the down count and returns the updated tally', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify({ 'ada-lovelace': { up: 3, down: 1 } }) as never,
    );
    const response = await POST(makePostRequest({ speakerId: 'ada-lovelace', vote: 'down' }));
    const tally = await response.json();
    expect(response.status).toBe(200);
    expect(tally).toEqual({ up: 3, down: 2 });
  });

  it('starts from zero when speaker has no prior votes', async () => {
    const response = await POST(makePostRequest({ speakerId: 'grace-hopper', vote: 'up' }));
    const tally = await response.json();
    expect(tally).toEqual({ up: 1, down: 0 });
  });

  it('creates the data directory before writing', async () => {
    await POST(makePostRequest({ speakerId: 'ada-lovelace', vote: 'up' }));
    expect(vi.mocked(fs.mkdir)).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('writes the updated ratings to the data file', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify({ 'ada-lovelace': { up: 1, down: 0 } }) as never,
    );
    await POST(makePostRequest({ speakerId: 'ada-lovelace', vote: 'up' }));
    expect(vi.mocked(fs.writeFile)).toHaveBeenCalled();
    const writtenJson = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
    const written = JSON.parse(writtenJson);
    expect(written['ada-lovelace']).toEqual({ up: 2, down: 0 });
  });

  it('returns 400 when speakerId is missing', async () => {
    const response = await POST(makePostRequest({ vote: 'up' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when speakerId is not a known speaker', async () => {
    const response = await POST(makePostRequest({ speakerId: 'unknown-person', vote: 'up' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when vote is not "up" or "down"', async () => {
    const response = await POST(makePostRequest({ speakerId: 'ada-lovelace', vote: 'sideways' }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when body is not valid JSON', async () => {
    const request = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: 'not-valid-json{{{',
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
