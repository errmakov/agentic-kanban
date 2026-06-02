import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockMkdir = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockReadFile = vi.hoisted(() => vi.fn());
const mockWriteFile = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('fs/promises', () => ({
  default: {
    mkdir: mockMkdir,
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  },
  mkdir: mockMkdir,
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));

import { GET, POST } from './route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
  });

  it('returns zeros when the file is absent', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ up: 0, down: 0 });
  });

  it('returns the stored tallies', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ up: 5, down: 2 }));
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual({ up: 5, down: 2 });
  });
});

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    mockWriteFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
  });

  it('returns 400 when vote is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when vote is invalid', async () => {
    const res = await POST(makeRequest({ vote: 'sideways' }));
    expect(res.status).toBe(400);
  });

  it('increments the up counter', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ up: 3, down: 1 }));
    const res = await POST(makeRequest({ vote: 'up' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ up: 4, down: 1 });
  });

  it('increments the down counter', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ up: 3, down: 1 }));
    const res = await POST(makeRequest({ vote: 'down' }));
    const body = await res.json();
    expect(body).toEqual({ up: 3, down: 2 });
  });

  it('starts from zero when the file is absent', async () => {
    const res = await POST(makeRequest({ vote: 'up' }));
    const body = await res.json();
    expect(body).toEqual({ up: 1, down: 0 });
  });

  it('ensures the data directory exists via mkdir', async () => {
    await POST(makeRequest({ vote: 'up' }));
    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('writes the updated tallies to file', async () => {
    await POST(makeRequest({ vote: 'up' }));
    expect(mockWriteFile).toHaveBeenCalledOnce();
    const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
    expect(written).toEqual({ up: 1, down: 0 });
  });
});
