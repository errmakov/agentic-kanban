import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

// Mock next/server only — fs/promises uses real I/O against a temp directory
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(data),
    }),
  },
}));

import type { GET as GETFn, POST as POSTFn, EMOJIS as AllEmojis } from './route';

let GET: typeof GETFn;
let POST: typeof POSTFn;
let EMOJIS: typeof AllEmojis;
let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'reactions-test-'));
  process.env.DATA_DIR = tempDir;
  // Re-import after env change so module-level constants pick up the new DATA_DIR
  vi.resetModules();
  ({ GET, POST, EMOJIS } = await import('./route'));
});

afterEach(async () => {
  delete process.env.DATA_DIR;
  await rm(tempDir, { recursive: true, force: true });
});

describe('GET /api/reactions', () => {
  it('returns zero counts for all emojis when the data file is missing', async () => {
    const response = await GET();
    const data = await response.json();

    expect(Object.keys(data)).toHaveLength(EMOJIS.length);
    for (const emoji of EMOJIS) {
      expect(data[emoji]).toBe(0);
    }
  });

  it('returns stored counts merged with zero defaults so all emojis are always present', async () => {
    await writeFile(join(tempDir, 'reactions.json'), JSON.stringify({ '👍': 5, '❤️': 3 }), 'utf8');

    const response = await GET();
    const data = await response.json();

    expect(data['👍']).toBe(5);
    expect(data['❤️']).toBe(3);
    expect(data['🔥']).toBe(0);
    expect(data['👏']).toBe(0);
    expect(data['😂']).toBe(0);
  });

  it('falls back to all-zero defaults when the stored JSON is corrupt', async () => {
    await writeFile(join(tempDir, 'reactions.json'), '{{not-valid-json}}', 'utf8');

    const response = await GET();
    const data = await response.json();

    for (const emoji of EMOJIS) {
      expect(data[emoji]).toBe(0);
    }
  });
});

describe('POST /api/reactions', () => {
  it('increments the target emoji count and returns all updated counts', async () => {
    await writeFile(
      join(tempDir, 'reactions.json'),
      JSON.stringify({ '👍': 2, '❤️': 0, '🔥': 0, '👏': 0, '😂': 0 }),
      'utf8',
    );

    const request = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji: '👍' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data['👍']).toBe(3);
    expect(data['❤️']).toBe(0);
  });

  it('persists the incremented count to the JSON file', async () => {
    const request = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji: '🔥' }),
    });

    await POST(request);

    const stored = JSON.parse(await readFile(join(tempDir, 'reactions.json'), 'utf8'));
    expect(stored['🔥']).toBe(1);
  });

  it('creates reactions.json when no data file exists yet', async () => {
    const request = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji: '❤️' }),
    });

    await POST(request);

    const content = await readFile(join(tempDir, 'reactions.json'), 'utf8');
    expect(JSON.parse(content)['❤️']).toBe(1);
  });

  it('returns 400 for an emoji not in the allowed set', async () => {
    const request = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji: '🎉' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('returns 400 for malformed JSON body', async () => {
    const request = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{{{',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('returns 400 when the emoji field is absent from the body', async () => {
    const request = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction: '👍' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('returns 400 when emoji is a non-string value', async () => {
    const request = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji: 42 }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('does not write to disk when emoji validation fails', async () => {
    const request = new Request('http://localhost/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji: '🎉' }),
    });

    await POST(request);

    await expect(readFile(join(tempDir, 'reactions.json'), 'utf8')).rejects.toThrow();
  });
});
