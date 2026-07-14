import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Re-import route.ts fresh for each test so DATA_DIR is picked up at module load time.
type RouteModule = typeof import('./route');
let routeGET: RouteModule['GET'];
let routePOST: RouteModule['POST'];
let EMOJIS: RouteModule['EMOJIS'];

let tmpDir: string;

const zeroCounts = () => Object.fromEntries(['👍', '❤️', '🔥', '🎉'].map((e) => [e, 0]));

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'emoji-test-'));
  process.env.DATA_DIR = tmpDir;
  vi.resetModules();
  const route = await import('./route') as RouteModule;
  routeGET = route.GET;
  routePOST = route.POST;
  EMOJIS = route.EMOJIS;
});

afterEach(async () => {
  delete process.env.DATA_DIR;
  await rm(tmpDir, { recursive: true, force: true });
  vi.resetModules();
});

describe('GET /api/emoji-reactions', () => {
  it('returns zeroed counts when the data file does not exist', async () => {
    const res = await routeGET();
    const json = await res.json();
    expect(json.counts).toEqual(zeroCounts());
  });

  it('returns persisted counts from the data file', async () => {
    const stored = { '👍': 5, '❤️': 2, '🔥': 7, '🎉': 1 };
    await writeFile(join(tmpDir, 'emoji-reactions.json'), JSON.stringify(stored));
    const res = await routeGET();
    const json = await res.json();
    expect(json.counts).toEqual(stored);
  });

  it('merges stored counts onto zeroed base so missing emoji keys are present', async () => {
    await writeFile(join(tmpDir, 'emoji-reactions.json'), JSON.stringify({ '👍': 3 }));
    const res = await routeGET();
    const json = await res.json();
    expect(json.counts['👍']).toBe(3);
    expect(json.counts['❤️']).toBe(0);
  });

  it('falls back to zero counts when the data file contains corrupt JSON', async () => {
    await writeFile(join(tmpDir, 'emoji-reactions.json'), 'not { valid json');
    const res = await routeGET();
    const json = await res.json();
    expect(json.counts).toEqual(zeroCounts());
  });
});

describe('POST /api/emoji-reactions', () => {
  it('increments the count for a valid emoji and returns 200', async () => {
    const stored = { '👍': 3, '❤️': 0, '🔥': 0, '🎉': 0 };
    await writeFile(join(tmpDir, 'emoji-reactions.json'), JSON.stringify(stored));
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '👍' }),
    });
    const res = await routePOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.counts['👍']).toBe(4);
  });

  it('returns 400 for an unknown emoji', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '🐸' }),
    });
    const res = await routePOST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Unknown emoji');
  });

  it('returns 400 when the emoji field is missing from the body', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await routePOST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when the request body is not valid JSON', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: 'not json at all',
    });
    const res = await routePOST(req);
    expect(res.status).toBe(400);
  });

  it('starts from zero counts when the data file is missing (first ever reaction)', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '🎉' }),
    });
    const res = await routePOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.counts['🎉']).toBe(1);
    expect(json.counts['👍']).toBe(0);
  });

  it('recovers from corrupt JSON in the data file by starting counts from zero', async () => {
    await writeFile(join(tmpDir, 'emoji-reactions.json'), '{ corrupt');
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '❤️' }),
    });
    const res = await routePOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.counts['❤️']).toBe(1);
  });

  it('persists the updated counts to disk so a subsequent GET reflects the increment', async () => {
    const req = new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      body: JSON.stringify({ emoji: '🔥' }),
    });
    await routePOST(req);

    const raw = await readFile(join(tmpDir, 'emoji-reactions.json'), 'utf8');
    const written = JSON.parse(raw) as Record<string, number>;
    expect(written['🔥']).toBe(1);
  });

  it('EMOJIS constant exports the full whitelisted set', () => {
    expect(EMOJIS).toContain('👍');
    expect(EMOJIS).toContain('❤️');
    expect(EMOJIS).toContain('🔥');
    expect(EMOJIS).toContain('🎉');
    expect(EMOJIS).toHaveLength(4);
  });
});
