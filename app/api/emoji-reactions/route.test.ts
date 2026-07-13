import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

let testDir: string;

// Re-import the module dynamically after pointing DATA_DIR at the temp dir,
// because `dir` and `file` are computed at module load time.
let GET: (req?: Request) => Promise<Response>;
let POST: (req: Request) => Promise<Response>;
let EMOJIS: readonly string[];

beforeEach(async () => {
  testDir = await mkdtemp(path.join(tmpdir(), 'emoji-test-'));
  process.env.DATA_DIR = testDir;
  vi.resetModules();
  const mod = await import('./route');
  GET = mod.GET as typeof GET;
  POST = mod.POST as typeof POST;
  EMOJIS = mod.EMOJIS;
});

afterEach(async () => {
  delete process.env.DATA_DIR;
  await rm(testDir, { recursive: true, force: true });
});

describe('GET /api/emoji-reactions', () => {
  it('returns all six emojis defaulting to 0 when no data file exists', async () => {
    const res = await GET();
    const data = await res.json();

    expect(Object.keys(data)).toHaveLength(6);
    for (const emoji of EMOJIS) {
      expect(data[emoji]).toBe(0);
    }
  });

  it('returns persisted counts merged with defaults for missing emojis', async () => {
    await writeFile(
      path.join(testDir, 'emoji-reactions.json'),
      JSON.stringify({ '👍': 42 }),
    );

    const res = await GET();
    const data = await res.json();

    expect(data['👍']).toBe(42);
    expect(data['❤️']).toBe(0);
    expect(Object.keys(data)).toHaveLength(6);
  });
});

describe('POST /api/emoji-reactions', () => {
  it('increments the count for a valid emoji and returns all six emojis', async () => {
    await writeFile(
      path.join(testDir, 'emoji-reactions.json'),
      JSON.stringify({ '👍': 10 }),
    );

    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '👍' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data['👍']).toBe(11);
    expect(Object.keys(data)).toHaveLength(6);
  });

  it('initialises the count to 1 for an emoji not yet in the file', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '🎉' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data['🎉']).toBe(1);
    for (const emoji of EMOJIS.filter((e) => e !== '🎉')) {
      expect(data[emoji]).toBe(0);
    }
  });

  it('persists the incremented count to disk', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '🔥' }),
    });

    await POST(req);

    // Confirm the file was actually written with the new count
    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(path.join(testDir, 'emoji-reactions.json'), 'utf8');
    const stored = JSON.parse(raw);
    expect(stored['🔥']).toBe(1);
  });

  it('returns 400 for an emoji not in the allowed set', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '💩' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('invalid emoji');
  });

  it('returns 400 when the emoji field is missing', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ other: 'field' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when the body is not valid JSON', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: 'not-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when the emoji field is not a string', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: 123 }),
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

    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '😂' }),
    });

    const res = await nestedPOST(req);
    expect(res.status).toBe(200);

    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(path.join(nested, 'emoji-reactions.json'), 'utf8');
    expect(JSON.parse(raw)['😂']).toBe(1);
  });
});

describe('EMOJIS constant', () => {
  it('contains exactly the six specified emojis in order', () => {
    expect(EMOJIS).toEqual(['👍', '❤️', '😂', '🔥', '🎉', '🤯']);
  });
});
