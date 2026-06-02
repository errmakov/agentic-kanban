import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

// Set DATA_DIR before route module loads (vi.hoisted runs before all static imports)
vi.hoisted(() => {
  process.env.DATA_DIR = `/tmp/vitest-session-${process.pid}`;
});

import { GET, POST } from './route';
import { mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dataDir = process.env.DATA_DIR as string;
const sessionFile = join(dataDir, 'session.json');

function postRequest(body: unknown): Request {
  return new Request('http://localhost/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  await mkdir(dataDir, { recursive: true });
});

afterAll(async () => {
  await rm(dataDir, { recursive: true, force: true });
  delete process.env.DATA_DIR;
});

beforeEach(async () => {
  await rm(sessionFile, { force: true });
});

describe('GET /api/session', () => {
  it('returns { name: "" } when session file does not exist', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: '' });
  });

  it('returns the stored session name', async () => {
    await writeFile(sessionFile, JSON.stringify({ name: 'My Session' }), 'utf-8');
    const res = await GET();
    expect(await res.json()).toEqual({ name: 'My Session' });
  });

  it('returns { name: "" } when stored name is not a string', async () => {
    await writeFile(sessionFile, JSON.stringify({ name: 42 }), 'utf-8');
    const res = await GET();
    expect(await res.json()).toEqual({ name: '' });
  });

  it('returns { name: "" } when file contains malformed JSON', async () => {
    await writeFile(sessionFile, '{bad json', 'utf-8');
    const res = await GET();
    expect(await res.json()).toEqual({ name: '' });
  });
});

describe('POST /api/session', () => {
  it('persists and returns the session name', async () => {
    const res = await POST(postRequest({ name: 'My Session' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: 'My Session' });
    const stored = JSON.parse(await readFile(sessionFile, 'utf-8'));
    expect(stored).toEqual({ name: 'My Session' });
  });

  it('a subsequent GET returns the persisted name', async () => {
    await POST(postRequest({ name: 'Persistent Session' }));
    const res = await GET();
    expect(await res.json()).toEqual({ name: 'Persistent Session' });
  });

  it('returns 400 when body has no name field', async () => {
    const res = await POST(postRequest({ foo: 'bar' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty('error');
  });

  it('returns 400 when name is not a string', async () => {
    const res = await POST(postRequest({ name: 42 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is null', async () => {
    const res = await POST(postRequest(null));
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is invalid JSON', async () => {
    const req = new Request('http://localhost/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json{{{',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
