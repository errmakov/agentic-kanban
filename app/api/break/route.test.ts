import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
}));

vi.mock('fs', () => ({
  default: { promises: mocks },
  promises: mocks,
}));

import { GET } from './route';

const NOW = new Date('2026-06-02T12:00:00.000Z').getTime();
const FUTURE_ISO = new Date('2026-06-02T13:00:00.000Z').toISOString();
const PAST_ISO = new Date('2026-06-01T12:00:00.000Z').toISOString();

describe('GET /api/break', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    mocks.mkdir.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns { breakAt: null } when break.json does not exist', async () => {
    mocks.readFile.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    const res = await GET();
    expect(await res.json()).toEqual({ breakAt: null });
  });

  it('returns { breakAt: null } when break.json contains malformed JSON', async () => {
    mocks.readFile.mockResolvedValue('not valid json');
    const res = await GET();
    expect(await res.json()).toEqual({ breakAt: null });
  });

  it('returns { breakAt: null } when breakAt field is missing', async () => {
    mocks.readFile.mockResolvedValue(JSON.stringify({}));
    const res = await GET();
    expect(await res.json()).toEqual({ breakAt: null });
  });

  it('returns { breakAt: null } when breakAt is not a valid date string', async () => {
    mocks.readFile.mockResolvedValue(JSON.stringify({ breakAt: 'not-a-date' }));
    const res = await GET();
    expect(await res.json()).toEqual({ breakAt: null });
  });

  it('returns { breakAt: null } when breakAt is in the past', async () => {
    mocks.readFile.mockResolvedValue(JSON.stringify({ breakAt: PAST_ISO }));
    const res = await GET();
    expect(await res.json()).toEqual({ breakAt: null });
  });

  it('returns { breakAt: null } when breakAt equals the current time', async () => {
    mocks.readFile.mockResolvedValue(JSON.stringify({ breakAt: new Date(NOW).toISOString() }));
    const res = await GET();
    expect(await res.json()).toEqual({ breakAt: null });
  });

  it('returns { breakAt } when breakAt is in the future', async () => {
    mocks.readFile.mockResolvedValue(JSON.stringify({ breakAt: FUTURE_ISO }));
    const res = await GET();
    expect(await res.json()).toEqual({ breakAt: FUTURE_ISO });
  });
});
