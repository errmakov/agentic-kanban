import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ZERO_COUNTS = { '👍': 0, '❤️': 0, '🔥': 0, '👏': 0, '😂': 0 };

let tmpDir: string;

beforeEach(async () => {
  vi.resetModules();
  tmpDir = await mkdtemp(join(tmpdir(), 'emoji-test-'));
  process.env.DATA_DIR = tmpDir;
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
  delete process.env.DATA_DIR;
});

// Re-imports the route with the current DATA_DIR after vi.resetModules()
async function loadRoute() {
  return import('./route');
}

function makePostRequest(body: unknown) {
  return new Request('http://localhost/api/emoji-reaction-bar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('emoji-reaction-bar API route', () => {
  describe('GET', () => {
    it('returns zero counts when the data file does not exist', async () => {
      const { GET } = await loadRoute();
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(ZERO_COUNTS);
    });

    it('returns persisted counts from the data file', async () => {
      const stored = { '👍': 5, '❤️': 2, '🔥': 3, '👏': 1, '😂': 7 };
      await writeFile(join(tmpDir, 'emoji-reaction-bar.json'), JSON.stringify(stored), 'utf8');

      const { GET } = await loadRoute();
      const response = await GET();
      const data = await response.json();

      expect(data).toEqual(stored);
    });

    it('falls back to zero counts when the file contains corrupted JSON', async () => {
      await writeFile(join(tmpDir, 'emoji-reaction-bar.json'), 'not valid json {{{', 'utf8');

      const { GET } = await loadRoute();
      const response = await GET();
      const data = await response.json();

      expect(data).toEqual(ZERO_COUNTS);
    });

    it('includes all supported emojis in the response', async () => {
      const { GET, EMOJIS } = await loadRoute();
      const response = await GET();
      const data = await response.json();

      for (const emoji of EMOJIS) {
        expect(data).toHaveProperty(emoji);
      }
    });
  });

  describe('POST', () => {
    it('increments the given emoji count and returns updated counts', async () => {
      const stored = { '👍': 2, '❤️': 0, '🔥': 0, '👏': 0, '😂': 0 };
      await writeFile(join(tmpDir, 'emoji-reaction-bar.json'), JSON.stringify(stored), 'utf8');

      const { POST } = await loadRoute();
      const response = await POST(makePostRequest({ emoji: '👍' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data['👍']).toBe(3);
    });

    it('persists the incremented count to the data file', async () => {
      const { POST } = await loadRoute();
      await POST(makePostRequest({ emoji: '🔥' }));

      const written = JSON.parse(
        await readFile(join(tmpDir, 'emoji-reaction-bar.json'), 'utf8'),
      );
      expect(written['🔥']).toBe(1);
    });

    it('starts from zero when no prior data exists', async () => {
      const { POST } = await loadRoute();
      const response = await POST(makePostRequest({ emoji: '😂' }));
      const data = await response.json();

      expect(data).toEqual({ ...ZERO_COUNTS, '😂': 1 });
    });

    it('returns 400 for an unknown emoji', async () => {
      const { POST } = await loadRoute();
      const response = await POST(makePostRequest({ emoji: '🦄' }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('unknown emoji');
    });

    it('returns 400 when the emoji field is a number', async () => {
      const { POST } = await loadRoute();
      const response = await POST(makePostRequest({ emoji: 42 }));

      expect(response.status).toBe(400);
    });

    it('returns 400 for an invalid JSON body', async () => {
      const { POST } = await loadRoute();
      const request = new Request('http://localhost/api/emoji-reaction-bar', {
        method: 'POST',
        body: 'this is not json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('invalid body');
    });
  });
});
