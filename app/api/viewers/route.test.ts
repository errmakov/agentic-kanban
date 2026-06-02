import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const fsMock = vi.hoisted(() => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('fs/promises', () => ({
  default: fsMock,
  mkdir: fsMock.mkdir,
  readFile: fsMock.readFile,
  writeFile: fsMock.writeFile,
}));

import { GET } from './route';

function makeRequest(id?: string): NextRequest {
  const url = id
    ? `http://localhost/api/viewers?id=${encodeURIComponent(id)}`
    : 'http://localhost/api/viewers';
  return new NextRequest(url);
}

describe('GET /api/viewers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsMock.mkdir.mockResolvedValue(undefined);
    fsMock.readFile.mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
    );
    fsMock.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns count 0 when the file is missing and no id is provided', async () => {
    const res = await GET(makeRequest());
    expect(await res.json()).toEqual({ count: 0 });
  });

  it('registers a new viewer and returns count 1 when an id is provided', async () => {
    const res = await GET(makeRequest('test-id'));
    expect(await res.json()).toEqual({ count: 1 });
  });

  it('writes the updated viewer map to disk', async () => {
    await GET(makeRequest('abc'));
    expect(fsMock.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"abc"'),
    );
  });

  it('prunes viewers older than 45 seconds', async () => {
    const NOW = 1_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(NOW);

    fsMock.readFile.mockResolvedValue(
      JSON.stringify({
        'fresh-id': NOW - 10_000,
        'expired-id': NOW - 50_000,
      }),
    );

    const res = await GET(makeRequest());
    expect(await res.json()).toEqual({ count: 1 });
  });

  it('counts the caller when id is provided alongside a stale entry', async () => {
    const NOW = 2_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(NOW);

    fsMock.readFile.mockResolvedValue(
      JSON.stringify({ 'old-id': NOW - 60_000 }),
    );

    const res = await GET(makeRequest('new-id'));
    expect(await res.json()).toEqual({ count: 1 });
  });

  it('falls back to an empty map when viewers.json contains invalid JSON', async () => {
    fsMock.readFile.mockResolvedValue('{ not valid json');
    const res = await GET(makeRequest());
    expect(await res.json()).toEqual({ count: 0 });
  });

  it('falls back to an empty map when viewers.json is not a plain object', async () => {
    fsMock.readFile.mockResolvedValue(JSON.stringify([1, 2, 3]));
    const res = await GET(makeRequest());
    expect(await res.json()).toEqual({ count: 0 });
  });

  it('skips upsert when no id query param is present', async () => {
    const NOW = 3_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(NOW);

    fsMock.readFile.mockResolvedValue(
      JSON.stringify({ 'viewer-1': NOW - 5_000 }),
    );

    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body).toEqual({ count: 1 });

    const written = JSON.parse(fsMock.writeFile.mock.calls[0][1] as string);
    expect(Object.keys(written)).not.toContain('');
  });
});
