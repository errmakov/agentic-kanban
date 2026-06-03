// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { GET, POST } from './route';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const defaults = { up: 0, down: 0 };
const stored = { up: 7, down: 3 };

function makePostRequest(body: unknown) {
  return new Request('http://localhost/api/feedback-widget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/feedback-widget', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns defaults when file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(defaults);
  });

  it('returns stored counts when file exists', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(stored) as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(stored);
  });

  it('returns defaults when JSON is corrupt', async () => {
    vi.mocked(readFile).mockResolvedValue('not-valid-json' as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(defaults);
  });
});

describe('POST /api/feedback-widget', () => {
  beforeEach(() => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(stored) as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('increments up count on vote=up', async () => {
    const response = await POST(makePostRequest({ vote: 'up' }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.up).toBe(8);
    expect(data.down).toBe(3);
  });

  it('increments down count on vote=down', async () => {
    const response = await POST(makePostRequest({ vote: 'down' }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.up).toBe(7);
    expect(data.down).toBe(4);
  });

  it('returns 400 for invalid vote value', async () => {
    const response = await POST(makePostRequest({ vote: 'sideways' }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('invalid vote');
  });

  it('returns 400 when vote field is missing', async () => {
    const response = await POST(makePostRequest({}));

    expect(response.status).toBe(400);
  });

  it('returns 400 for malformed JSON body', async () => {
    const badRequest = new Request('http://localhost/api/feedback-widget', {
      method: 'POST',
      body: 'not-valid-json',
    });

    const response = await POST(badRequest);
    expect(response.status).toBe(400);
  });

  it('persists updated counts to disk', async () => {
    await POST(makePostRequest({ vote: 'up' }));

    expect(writeFile).toHaveBeenCalledOnce();
    const [, content] = vi.mocked(writeFile).mock.calls[0];
    const written = JSON.parse(content as string);
    expect(written.up).toBe(8);
  });

  it('ensures the data directory exists before writing', async () => {
    await POST(makePostRequest({ vote: 'down' }));

    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });
});
