import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentSession, NowSpeaking } from './index';

const SCHEDULE = [
  { start: '2026-06-03T09:00', title: 'Welcome & Intro' },
  { start: '2026-06-03T10:00', title: 'Second Session' },
  { start: '2026-06-03T11:00', title: 'Third Session' },
];

describe('getCurrentSession', () => {
  it('returns first session as upcoming when before any session', () => {
    const result = getCurrentSession(SCHEDULE, new Date('2026-06-03T08:00'));
    expect(result).toEqual({ title: 'Welcome & Intro', isUpcoming: true });
  });

  it('returns the active session when between sessions', () => {
    const result = getCurrentSession(SCHEDULE, new Date('2026-06-03T10:30'));
    expect(result).toEqual({ title: 'Second Session', isUpcoming: false });
  });

  it('returns the session at exact start time as in-progress', () => {
    const result = getCurrentSession(SCHEDULE, new Date('2026-06-03T11:00'));
    expect(result).toEqual({ title: 'Third Session', isUpcoming: false });
  });

  it('returns the last session after all sessions have passed', () => {
    const result = getCurrentSession(SCHEDULE, new Date('2026-06-03T23:00'));
    expect(result).toEqual({ title: 'Third Session', isUpcoming: false });
  });
});

describe('NowSpeaking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T09:30'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "now speaking" banner after mount timers fire', async () => {
    render(<NowSpeaking />);
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });
});
