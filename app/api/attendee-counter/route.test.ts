// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

import { readFile, writeFile, mkdir } from 'fs/promises';
import { GET, POST } from './route';

const FIXED_NOW = new Date('2026-06-03T10:00:00Z').getTime();

function mockSessions(sessions: Record<string, number>) {
  vi.mocked(readFile).mockResolvedValue(JSON.stringify(sessions) as never);
}

function mockMissingFile() {
  vi.mocked(readFile).mockRejectedValue(
    Object.assign(new Error('ENOENT'), { code: 'ENOENT' }),
  );
}

function writtenSessions(): Record<string, number> {
  const calls = vi.mocked(writeFile).mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  return JSON.parse(calls[calls.length - 1][1] as string);
}

describe('GET /api/attendee-counter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    vi.mocked(mkdir).mockResolvedValue(undefined as never);
    vi.mocked(writeFile).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns count 0 when the session file does not exist', async () => {
    mockMissingFile();
    const response = await GET();
    expect(await response.json()).toEqual({ count: 0 });
  });

  it('returns the count of live sessions', async () => {
    mockSessions({
      'session-a': FIXED_NOW - 10_000,
      'session-b': FIXED_NOW - 30_000,
    });
    const response = await GET();
    expect(await response.json()).toEqual({ count: 2 });
  });

  it('returns count 1 when exactly one session is at the 60-second boundary', async () => {
    mockSessions({
      'at-boundary': FIXED_NOW - 59_999,
      'just-expired': FIXED_NOW - 60_000,
    });
    const response = await GET();
    expect(await response.json()).toEqual({ count: 1 });
  });

  it('prunes sessions inactive for more than 60 seconds', async () => {
    mockSessions({
      alive: FIXED_NOW - 10_000,
      expired: FIXED_NOW - 61_000,
    });
    const response = await GET();
    expect(await response.json()).toEqual({ count: 1 });
  });

  it('writes the pruned session list back to disk', async () => {
    mockSessions({
      alive: FIXED_NOW - 10_000,
      expired: FIXED_NOW - 61_000,
    });
    await GET();
    const written = writtenSessions();
    expect(Object.keys(written)).toEqual(['alive']);
  });

  it('creates the data directory before writing', async () => {
    mockMissingFile();
    await GET();
    expect(vi.mocked(mkdir)).toHaveBeenCalledWith(
      expect.any(String),
      { recursive: true },
    );
  });
});

describe('POST /api/attendee-counter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    vi.mocked(mkdir).mockResolvedValue(undefined as never);
    vi.mocked(writeFile).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const makeRequest = (body: object) =>
    new Request('http://localhost/api/attendee-counter', {
      method: 'POST',
      body: JSON.stringify(body),
    });

  it('adds a new session and returns count 1', async () => {
    mockMissingFile();
    const response = await POST(makeRequest({ sessionId: 'new-session' }));
    expect(await response.json()).toEqual({ count: 1 });
  });

  it('persists the session at the current timestamp', async () => {
    mockMissingFile();
    await POST(makeRequest({ sessionId: 'my-session' }));
    expect(writtenSessions()['my-session']).toBe(FIXED_NOW);
  });

  it('updates an existing session timestamp to now', async () => {
    mockSessions({ 'session-1': FIXED_NOW - 50_000 });
    await POST(makeRequest({ sessionId: 'session-1' }));
    expect(writtenSessions()['session-1']).toBe(FIXED_NOW);
  });

  it('prunes expired sessions before counting', async () => {
    mockSessions({ expired: FIXED_NOW - 70_000 });
    const response = await POST(makeRequest({ sessionId: 'fresh' }));
    expect(await response.json()).toEqual({ count: 1 }); // only fresh
  });

  it('does not add an entry when sessionId is missing', async () => {
    mockMissingFile();
    const response = await POST(makeRequest({}));
    expect(await response.json()).toEqual({ count: 0 });
  });

  it('accumulates multiple sessions correctly', async () => {
    mockSessions({
      'session-a': FIXED_NOW - 10_000,
      'session-b': FIXED_NOW - 20_000,
    });
    const response = await POST(makeRequest({ sessionId: 'session-c' }));
    expect(await response.json()).toEqual({ count: 3 });
  });

  it('creates the data directory before writing', async () => {
    mockMissingFile();
    await POST(makeRequest({ sessionId: 'any' }));
    expect(vi.mocked(mkdir)).toHaveBeenCalledWith(
      expect.any(String),
      { recursive: true },
    );
  });
});
