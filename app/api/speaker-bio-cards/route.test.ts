import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SPEAKERS } from '@/features/speaker-bio-cards/speakers';

let testDir: string;

let GET: () => Promise<Response>;
let POST: (req: Request) => Promise<Response>;

beforeEach(async () => {
  testDir = await mkdtemp(path.join(tmpdir(), 'speaker-bio-cards-test-'));
  process.env.DATA_DIR = testDir;
  vi.resetModules();
  const mod = await import('./route');
  GET = mod.GET as typeof GET;
  POST = mod.POST as typeof POST;
});

afterEach(async () => {
  delete process.env.DATA_DIR;
  await rm(testDir, { recursive: true, force: true });
});

describe('GET /api/speaker-bio-cards', () => {
  it('returns all speaker IDs with zero counts when no data file exists', async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.tallies).toBeDefined();
    for (const speaker of SPEAKERS) {
      expect(data.tallies[speaker.id]).toEqual({ up: 0, down: 0 });
    }
    expect(Object.keys(data.tallies)).toHaveLength(SPEAKERS.length);
  });

  it('merges persisted tallies with defaults for any speaker not yet in the file', async () => {
    await writeFile(
      path.join(testDir, 'speaker-bio-cards.json'),
      JSON.stringify({ 'alice-nguyen': { up: 5, down: 2 } }),
    );

    const res = await GET();
    const data = await res.json();

    expect(data.tallies['alice-nguyen']).toEqual({ up: 5, down: 2 });
    for (const speaker of SPEAKERS.filter((s) => s.id !== 'alice-nguyen')) {
      expect(data.tallies[speaker.id]).toEqual({ up: 0, down: 0 });
    }
  });

  it('returns all speaker IDs even when the file contains extra phantom IDs', async () => {
    await writeFile(
      path.join(testDir, 'speaker-bio-cards.json'),
      JSON.stringify({ 'phantom-person': { up: 99, down: 0 } }),
    );

    const res = await GET();
    const data = await res.json();

    expect(Object.keys(data.tallies)).toHaveLength(SPEAKERS.length);
    expect(data.tallies['phantom-person']).toBeUndefined();
  });
});

describe('POST /api/speaker-bio-cards', () => {
  it('increments the up count and returns the updated tally', async () => {
    await writeFile(
      path.join(testDir, 'speaker-bio-cards.json'),
      JSON.stringify({ 'alice-nguyen': { up: 3, down: 1 } }),
    );

    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 'alice-nguyen', vote: 'up' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.speakerId).toBe('alice-nguyen');
    expect(data.tally).toEqual({ up: 4, down: 1 });
  });

  it('increments the down count and returns the updated tally', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 'alice-nguyen', vote: 'down' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.tally).toEqual({ up: 0, down: 1 });
  });

  it('initialises from zero when the speaker has no prior tally', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 'ben-okafor', vote: 'up' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.tally).toEqual({ up: 1, down: 0 });
  });

  it('persists the incremented tally to disk', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 'carla-mendes', vote: 'up' }),
    });

    await POST(req);

    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(path.join(testDir, 'speaker-bio-cards.json'), 'utf8');
    const stored = JSON.parse(raw);
    expect(stored['carla-mendes']).toEqual({ up: 1, down: 0 });
  });

  it('returns 400 for an unknown speakerId', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 'unknown-person', vote: 'up' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('invalid speakerId');
  });

  it('returns 400 when speakerId is missing', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ vote: 'up' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when speakerId is not a string', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 42, vote: 'up' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid vote value', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 'alice-nguyen', vote: 'sideways' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('invalid vote');
  });

  it('returns 400 when vote is missing', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 'alice-nguyen' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when the request body is not valid JSON', async () => {
    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: 'not-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates DATA_DIR automatically if it does not exist', async () => {
    const nested = path.join(testDir, 'deep', 'nested');
    process.env.DATA_DIR = nested;
    vi.resetModules();
    const mod = await import('./route');
    const nestedPOST = mod.POST as typeof POST;

    const req = new Request('http://localhost/api/speaker-bio-cards', {
      method: 'POST',
      body: JSON.stringify({ speakerId: 'alice-nguyen', vote: 'up' }),
    });

    const res = await nestedPOST(req);
    expect(res.status).toBe(200);

    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(path.join(nested, 'speaker-bio-cards.json'), 'utf8');
    expect(JSON.parse(raw)['alice-nguyen']).toEqual({ up: 1, down: 0 });
  });
});
