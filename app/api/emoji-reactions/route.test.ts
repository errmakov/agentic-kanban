import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockReadFile, mockWriteFile, mockMkdir } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockWriteFile: vi.fn().mockResolvedValue(undefined),
  mockMkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
    mkdir: mockMkdir,
  },
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { GET, POST } from './route';

const DEFAULT_COUNTS = { '👍': 0, '❤️': 0, '😂': 0, '🎉': 0, '🤯': 0 };
const STORED_COUNTS = { '👍': 5, '❤️': 2, '😂': 1, '🎉': 10, '🤯': 3 };

beforeEach(() => {
  vi.clearAllMocks();
  mockWriteFile.mockResolvedValue(undefined);
  mockMkdir.mockResolvedValue(undefined);
});

describe('GET /api/emoji-reactions', () => {
  it('returns zeroed counts for all emoji when data file is missing', async () => {
    mockReadFile.mockRejectedValueOnce(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

    const response = await GET();
    const data = await response.json();

    expect(data.counts).toEqual(DEFAULT_COUNTS);
  });

  it('returns stored counts when data file exists', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify(STORED_COUNTS));

    const response = await GET();
    const data = await response.json();

    expect(data.counts).toEqual(STORED_COUNTS);
  });
});

describe('POST /api/emoji-reactions', () => {
  beforeEach(() => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ '👍': 2, '❤️': 0, '😂': 0, '🎉': 0, '🤯': 0 }),
    );
  });

  function makeRequest(body: unknown): Request {
    return new Request('http://localhost/api/emoji-reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('increments the count for a valid emoji and returns updated counts', async () => {
    const response = await POST(makeRequest({ emoji: '👍' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.counts['👍']).toBe(3);
  });

  it('writes updated counts to disk', async () => {
    await POST(makeRequest({ emoji: '👍' }));

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('emoji-reactions.json'),
      expect.stringContaining('"👍":3'),
    );
  });

  it('returns 400 for an unrecognized emoji string', async () => {
    const response = await POST(makeRequest({ emoji: '🚀' }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Unknown emoji');
  });

  it('returns 400 when emoji is a number', async () => {
    const response = await POST(makeRequest({ emoji: 42 }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when emoji is null', async () => {
    const response = await POST(makeRequest({ emoji: null }));
    expect(response.status).toBe(400);
  });

  it('creates DATA_DIR directory with the recursive option', async () => {
    await POST(makeRequest({ emoji: '❤️' }));

    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('uses DATA_DIR environment variable for the storage path', async () => {
    const original = process.env.DATA_DIR;
    process.env.DATA_DIR = '/custom/data';
    try {
      await POST(makeRequest({ emoji: '🎉' }));
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('/custom/data'),
        expect.any(String),
      );
    } finally {
      if (original === undefined) delete process.env.DATA_DIR;
      else process.env.DATA_DIR = original;
    }
  });

  it('falls back to ./data when DATA_DIR is not set', async () => {
    const original = process.env.DATA_DIR;
    delete process.env.DATA_DIR;
    try {
      await POST(makeRequest({ emoji: '🎉' }));
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('data'),
        expect.any(String),
      );
    } finally {
      if (original !== undefined) process.env.DATA_DIR = original;
    }
  });
});
