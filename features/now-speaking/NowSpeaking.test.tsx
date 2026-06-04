import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCurrentSession, NowSpeaking } from './index';

const SCHEDULE = [
  { start: '09:00', title: 'Opening Keynote' },
  { start: '11:00', title: 'Main Talk' },
  { start: '14:00', title: 'Closing Panel' },
];

describe('getCurrentSession', () => {
  it('returns upcoming=true with first session before any session starts', () => {
    const now = new Date(2026, 5, 4, 8, 30, 0); // 08:30
    const result = getCurrentSession(SCHEDULE, now);
    expect(result).toEqual({ title: 'Opening Keynote', upcoming: true });
  });

  it('returns the session exactly at its start time', () => {
    const now = new Date(2026, 5, 4, 9, 0, 0); // 09:00
    const result = getCurrentSession(SCHEDULE, now);
    expect(result).toEqual({ title: 'Opening Keynote', upcoming: false });
  });

  it('returns the most recently started session between two sessions', () => {
    const now = new Date(2026, 5, 4, 10, 0, 0); // 10:00 — between 09:00 and 11:00
    const result = getCurrentSession(SCHEDULE, now);
    expect(result).toEqual({ title: 'Opening Keynote', upcoming: false });
  });

  it('returns the last session after all sessions have started', () => {
    const now = new Date(2026, 5, 4, 17, 0, 0); // 17:00 — past all
    const result = getCurrentSession(SCHEDULE, now);
    expect(result).toEqual({ title: 'Closing Panel', upcoming: false });
  });

  it('returns null for an empty schedule', () => {
    const now = new Date(2026, 5, 4, 10, 0, 0);
    expect(getCurrentSession([], now)).toBeNull();
  });

  it('handles a single-session schedule before start', () => {
    const now = new Date(2026, 5, 4, 8, 0, 0);
    const result = getCurrentSession([{ start: '10:00', title: 'Solo Talk' }], now);
    expect(result).toEqual({ title: 'Solo Talk', upcoming: true });
  });

  it('handles a single-session schedule after start', () => {
    const now = new Date(2026, 5, 4, 12, 0, 0);
    const result = getCurrentSession([{ start: '10:00', title: 'Solo Talk' }], now);
    expect(result).toEqual({ title: 'Solo Talk', upcoming: false });
  });
});

describe('NowSpeaking component', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "Up next" label before first session', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 4, 8, 30, 0));
    render(<NowSpeaking />);
    expect(screen.getByText(/up next/i)).toBeInTheDocument();
    expect(screen.getByText('Opening Keynote: The Agentic Future')).toBeInTheDocument();
  });

  it('shows "Now speaking" label during a session', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 4, 9, 30, 0));
    render(<NowSpeaking />);
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
    expect(screen.getByText('Opening Keynote: The Agentic Future')).toBeInTheDocument();
  });
});
