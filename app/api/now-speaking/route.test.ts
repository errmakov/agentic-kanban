import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockReadFile, mockMkdir, mockWriteFile } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockMkdir: vi.fn(),
  mockWriteFile: vi.fn(),
}));

const mockPromises = vi.hoisted(() => ({
  readFile: mockReadFile,
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
}));

vi.mock('node:fs', () => ({
  default: { promises: mockPromises },
  promises: mockPromises,
}));

import { GET, PUT } from './route';

beforeEach(() => {
  vi.clearAllMocks();
  mockMkdir.mockResolvedValue(undefined);
  mockWriteFile.mockResolvedValue(undefined);
});

describe('GET /api/now-speaking', () => {
  it('returns { session: "" } when the data file does not exist', async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ session: '' });
  });

  it('returns the stored session name', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ session: 'My Talk' }));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ session: 'My Talk' });
  });

  it('returns { session: "" } when the file contains invalid JSON', async () => {
    mockReadFile.mockResolvedValue('not-valid-json{{');

    const response = await GET();
    const body = await response.json();

    expect(body).toEqual({ session: '' });
  });

  it('returns { session: "" } when the session field is not a string', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ session: 42 }));

    const response = await GET();
    const body = await response.json();

    expect(body).toEqual({ session: '' });
  });
});

describe('PUT /api/now-speaking', () => {
  function makeRequest(body: unknown) {
    return new Request('http://localhost/api/now-speaking', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('saves the session and returns it', async () => {
    const response = await PUT(makeRequest({ session: 'My Talk' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ session: 'My Talk' });
    expect(mockMkdir).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('now-speaking.json'),
      JSON.stringify({ session: 'My Talk' }),
      'utf8',
    );
  });

  it('trims leading and trailing whitespace from the session name', async () => {
    const response = await PUT(makeRequest({ session: '  Trimmed Talk  ' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ session: 'Trimmed Talk' });
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify({ session: 'Trimmed Talk' }),
      'utf8',
    );
  });

  it('returns 400 when session is an empty string', async () => {
    const response = await PUT(makeRequest({ session: '' }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('returns 400 when session is whitespace-only', async () => {
    const response = await PUT(makeRequest({ session: '   ' }));

    expect(response.status).toBe(400);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('returns 400 when the session field is missing', async () => {
    const response = await PUT(makeRequest({}));

    expect(response.status).toBe(400);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('returns 400 when the session field is a number', async () => {
    const response = await PUT(makeRequest({ session: 42 }));

    expect(response.status).toBe(400);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it('returns 400 when the request body is invalid JSON', async () => {
    const req = new Request('http://localhost/api/now-speaking', {
      method: 'PUT',
      body: 'not-json{{',
    });
    const response = await PUT(req);

    expect(response.status).toBe(400);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});
