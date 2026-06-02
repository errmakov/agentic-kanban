import { vi, describe, it, expect, beforeEach } from 'vitest';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { GET, POST } from './route';
import { EMOJIS } from '@/lib/emojis';

vi.mock('fs/promises');

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockMkdir = vi.mocked(mkdir);

function makeRequest(body: unknown) {
  return { json: async () => body } as Parameters<typeof POST>[0];
}

describe('GET /api/reactions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns zero counts when the data file does not exist', async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    for (const emoji of EMOJIS) {
      expect(data[emoji]).toBe(0);
    }
  });

  it('returns stored counts from the data file', async () => {
    const stored = { '👍': 5, '🎉': 2, '🤔': 0, '❤️': 1, '🚀': 3 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockReadFile.mockResolvedValue(JSON.stringify(stored) as any);
    const response = await GET();
    const data = await response.json();
    expect(data['👍']).toBe(5);
    expect(data['🎉']).toBe(2);
    expect(data['🚀']).toBe(3);
  });

  it('rethrows non-ENOENT errors', async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error('Permission denied'), { code: 'EACCES' }));
    await expect(GET()).rejects.toThrow('Permission denied');
  });
});

describe('POST /api/reactions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockMkdir.mockResolvedValue(undefined as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockWriteFile.mockResolvedValue(undefined as any);
  });

  it('returns 400 when the emoji field is missing', async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('invalid emoji');
  });

  it('returns 400 for an emoji not in the allowlist', async () => {
    const response = await POST(makeRequest({ emoji: '💩' }));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('invalid emoji');
  });

  it('increments the count for a valid emoji and returns updated counts', async () => {
    const stored = { '👍': 4, '🎉': 0, '🤔': 0, '❤️': 0, '🚀': 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockReadFile.mockResolvedValue(JSON.stringify(stored) as any);
    const response = await POST(makeRequest({ emoji: '👍' }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data['👍']).toBe(5);
  });

  it('initializes from zero when the data file does not exist', async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const response = await POST(makeRequest({ emoji: '🚀' }));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data['🚀']).toBe(1);
    for (const emoji of EMOJIS.filter((e) => e !== '🚀')) {
      expect(data[emoji]).toBe(0);
    }
  });

  it('creates the data directory and writes the updated counts to disk', async () => {
    const stored = { '👍': 2, '🎉': 0, '🤔': 0, '❤️': 0, '🚀': 0 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockReadFile.mockResolvedValue(JSON.stringify(stored) as any);
    await POST(makeRequest({ emoji: '👍' }));
    expect(mockMkdir).toHaveBeenCalledOnce();
    expect(mockWriteFile).toHaveBeenCalledOnce();
    const writtenJson = mockWriteFile.mock.calls[0][1] as string;
    expect(JSON.parse(writtenJson)['👍']).toBe(3);
  });
});
