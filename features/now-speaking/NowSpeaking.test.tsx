import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentSession, NowSpeaking } from './index';
import feature from './index';

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

  it('returns first session with isUpcoming true one millisecond before it starts', () => {
    const result = getCurrentSession(SCHEDULE, new Date('2026-06-03T08:59:59.999'));
    expect(result).toEqual({ title: 'Welcome & Intro', isUpcoming: true });
  });

  it('transitions to in-progress at the exact millisecond a session starts', () => {
    const result = getCurrentSession(SCHEDULE, new Date('2026-06-03T09:00:00.000'));
    expect(result).toEqual({ title: 'Welcome & Intro', isUpcoming: false });
  });
});

describe('NowSpeaking component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing before mount (SSR-safe: returns null initially)', () => {
    vi.setSystemTime(new Date('2026-06-03T09:30'));
    const { container } = render(<NowSpeaking />);
    // Before any timers fire, the component should render null
    expect(container.firstChild).toBeNull();
  });

  it('shows "Now speaking" label when a session is in progress', async () => {
    vi.setSystemTime(new Date('2026-06-03T09:30'));
    render(<NowSpeaking />);
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });

  it('shows "Up next" label when before the first session', async () => {
    vi.setSystemTime(new Date('2026-06-03T08:00'));
    render(<NowSpeaking />);
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText(/up next/i)).toBeInTheDocument();
  });

  it('displays the session title in the banner', async () => {
    vi.setSystemTime(new Date('2026-06-03T09:30'));
    render(<NowSpeaking />);
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText('Building the Kanban Loop')).toBeInTheDocument();
  });

  it('auto-advances to the next session when the interval fires', async () => {
    // Start at 10:59 — "SA/BA Agent Deep Dive" is current
    vi.setSystemTime(new Date('2026-06-03T10:59'));
    render(<NowSpeaking />);
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText('SA/BA Agent Deep Dive')).toBeInTheDocument();

    // Advance clock past 11:00, then fire the 30-second interval
    vi.setSystemTime(new Date('2026-06-03T11:00'));
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByText('Dev Agent & Feature Slots')).toBeInTheDocument();
  });

  it('shows the last session title after all sessions have ended', async () => {
    vi.setSystemTime(new Date('2026-06-03T23:00'));
    render(<NowSpeaking />);
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText('Q&A & Wrap-up')).toBeInTheDocument();
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });
});

describe('NowSpeaking feature descriptor', () => {
  it('exports a feature with the correct id', () => {
    expect(feature.id).toBe('now-speaking');
  });

  it('places the feature in the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('sets order to 5 so the banner renders at the top of main', () => {
    expect(feature.order).toBe(5);
  });

  it('uses NowSpeaking as the Component', () => {
    expect(feature.Component).toBe(NowSpeaking);
  });
});
