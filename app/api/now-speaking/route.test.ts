// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>();
  return {
    ...actual,
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  };
});

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { readFile, writeFile, mkdir } from 'fs/promises';
import { GET, POST } from './route';

function makeRequest(body: unknown): Request {
  return {
    json: async () => {
      if (body === null) throw new SyntaxError('invalid json');
      return body;
    },
  } as unknown as Request;
}

describe('GET /api/now-speaking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns { session: null } when the data file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const res = await GET();
    expect(await res.json()).toEqual({ session: null });
    expect(res.status).toBe(200);
  });

  it('returns the stored session name', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ session: 'Opening Keynote' }));
    const res = await GET();
    expect(await res.json()).toEqual({ session: 'Opening Keynote' });
  });

  it('returns { session: null } when session field is absent from the file', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({}));
    const res = await GET();
    expect(await res.json()).toEqual({ session: null });
  });

  it('returns { session: null } when the file contains invalid JSON', async () => {
    vi.mocked(readFile).mockResolvedValue('not-valid-json');
    const res = await GET();
    expect(await res.json()).toEqual({ session: null });
  });
});

describe('POST /api/now-speaking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  it('persists and returns the session name', async () => {
    const res = await POST(makeRequest({ session: 'Opening Keynote' }));
    expect(await res.json()).toEqual({ session: 'Opening Keynote' });
    expect(res.status).toBe(200);
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('now-speaking.json'),
      JSON.stringify({ session: 'Opening Keynote' }),
      'utf-8',
    );
  });

  it('creates the data directory before writing', async () => {
    await POST(makeRequest({ session: 'Keynote' }));
    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('returns 400 for an empty string session', async () => {
    const res = await POST(makeRequest({ session: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for a whitespace-only session', async () => {
    const res = await POST(makeRequest({ session: '   ' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when session is not a string', async () => {
    const res = await POST(makeRequest({ session: 42 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when session field is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when the request body is not valid JSON', async () => {
    const res = await POST(makeRequest(null));
    expect(res.status).toBe(400);
  });

  it('does not write to disk when validation fails', async () => {
    await POST(makeRequest({ session: '' }));
    expect(writeFile).not.toHaveBeenCalled();
  });
});
