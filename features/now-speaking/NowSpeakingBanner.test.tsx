import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { NowSpeakingBanner, currentSessionTitle } from './index';

afterEach(() => {
  vi.useRealTimers();
});

describe('currentSessionTitle', () => {
  it('shows the first session before anything has started', () => {
    expect(currentSessionTitle(new Date('2026-07-13T08:00:00'))).toBe('Opening Keynote');
  });

  it('shows the active session during the day', () => {
    expect(currentSessionTitle(new Date('2026-07-13T14:00:00'))).toBe(
      'Agent Pipelines in Practice',
    );
  });

  it('selects the session at its exact start boundary', () => {
    expect(currentSessionTitle(new Date('2026-07-13T10:30:00'))).toBe(
      'Building Live on Stage',
    );
  });

  it('shows the last session after the day is over', () => {
    expect(currentSessionTitle(new Date('2026-07-13T23:59:00'))).toBe('Closing Panel');
  });
});

describe('NowSpeakingBanner', () => {
  it('renders the current session after mount', () => {
    vi.useFakeTimers({ now: new Date('2026-07-13T14:00:00') });
    render(<NowSpeakingBanner />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Now Speaking:');
    expect(banner).toHaveTextContent('Agent Pipelines in Practice');
  });
});
