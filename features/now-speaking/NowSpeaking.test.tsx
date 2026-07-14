import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { NowSpeaking, getCurrentSession } from './index';

describe('getCurrentSession', () => {
  it('returns the first session as "up next" before the schedule starts', () => {
    const result = getCurrentSession(new Date('2026-07-14T08:00:00'));
    expect(result?.upNext).toBe(true);
    expect(result?.session.title).toBe('Opening Keynote');
  });

  it('returns the most recently started session during the day', () => {
    const result = getCurrentSession(new Date('2026-07-14T10:30:00'));
    expect(result?.upNext).toBe(false);
    expect(result?.session.title).toBe('Build Session 1 — The Pull System');
  });

  it('returns the last session after the schedule ends', () => {
    const result = getCurrentSession(new Date('2026-07-14T20:00:00'));
    expect(result?.upNext).toBe(false);
    expect(result?.session.title).toBe('Q&A and Wrap-up');
  });
});

describe('NowSpeaking', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the current session title from the clock', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T10:30:00'));
    render(<NowSpeaking />);
    expect(screen.getByText('Now speaking')).toBeInTheDocument();
    expect(
      screen.getByText('Build Session 1 — The Pull System'),
    ).toBeInTheDocument();
  });

  it('shows "Up next" before the first session', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-14T08:00:00'));
    render(<NowSpeaking />);
    expect(screen.getByText('Up next')).toBeInTheDocument();
    expect(screen.getByText('Opening Keynote')).toBeInTheDocument();
  });
});
