import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import NowSpeaking, { getCurrentSession } from './index';

const SCHEDULE = [
  { hour: 9, minute: 0, title: 'Opening Keynote' },
  { hour: 14, minute: 0, title: 'Scaling with AI Agents' },
  { hour: 16, minute: 30, title: 'Closing Remarks' },
];

describe('getCurrentSession', () => {
  it('returns a fallback when the schedule is empty', () => {
    expect(getCurrentSession(new Date(2026, 5, 4, 10, 0), [])).toBe(
      'No sessions scheduled',
    );
  });

  it('shows the first session as upcoming before it starts', () => {
    expect(getCurrentSession(new Date(2026, 5, 4, 7, 30), SCHEDULE)).toBe(
      'Up next: Opening Keynote',
    );
  });

  it('shows the session at its exact start time', () => {
    expect(getCurrentSession(new Date(2026, 5, 4, 14, 0), SCHEDULE)).toBe(
      'Scaling with AI Agents',
    );
  });

  it('shows the earlier session mid-way between two entries', () => {
    expect(getCurrentSession(new Date(2026, 5, 4, 12, 15), SCHEDULE)).toBe(
      'Opening Keynote',
    );
  });

  it('shows the last session after it has started', () => {
    expect(getCurrentSession(new Date(2026, 5, 4, 18, 0), SCHEDULE)).toBe(
      'Closing Remarks',
    );
  });
});

describe('NowSpeaking', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a session title in the banner', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 4, 10, 30));
    render(<NowSpeaking.Component />);
    expect(screen.getByText('Now speaking')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2 }),
    ).toHaveTextContent(/.+/);
  });
});
