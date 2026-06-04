import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DayAgenda } from './index';
import feature from './index';

describe('DayAgenda', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the heading', () => {
    render(<DayAgenda />);
    expect(screen.getByRole('heading', { name: /today's agenda/i })).toBeInTheDocument();
  });

  it('renders at least one agenda item', () => {
    render(<DayAgenda />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('renders at least 4 agenda items', () => {
    render(<DayAgenda />);
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(4);
  });

  it('renders all 8 agenda items', () => {
    render(<DayAgenda />);
    expect(screen.getAllByRole('listitem').length).toBe(8);
  });

  it('displays times and titles for the first and last agenda items', () => {
    render(<DayAgenda />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('Welcome & Intro')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('Q&A and Wrap-Up')).toBeInTheDocument();
  });

  it('does not highlight any item before the first session starts', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-04T08:00:00Z')); // 08:00 UTC, before 09:00 start
    render(<DayAgenda />);
    const activeItems = screen.getAllByRole('listitem').filter(li =>
      li.className.includes('border-blue-500'),
    );
    expect(activeItems.length).toBe(0);
  });

  it('highlights exactly one item during the workshop', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-04T10:00:00Z')); // 10:00 UTC, during sessions
    render(<DayAgenda />);
    const activeItems = screen.getAllByRole('listitem').filter(li =>
      li.className.includes('border-blue-500'),
    );
    expect(activeItems.length).toBe(1);
  });

  it('highlights the last item after all sessions end', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-04T20:00:00Z')); // 20:00 UTC, after 14:30 last session
    render(<DayAgenda />);
    const items = screen.getAllByRole('listitem');
    expect(items[items.length - 1].className).toContain('border-blue-500');
  });

  it('highlights the first session at exactly its start time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-04T09:00:00Z')); // exactly 09:00 UTC
    render(<DayAgenda />);
    const items = screen.getAllByRole('listitem');
    expect(items[0].className).toContain('border-blue-500');
  });

  it('non-active items do not have the active highlight class', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-04T09:00:00Z')); // only first item active
    render(<DayAgenda />);
    const items = screen.getAllByRole('listitem');
    // All items after index 0 should not be highlighted
    items.slice(1).forEach(li => {
      expect(li.className).not.toContain('border-blue-500');
    });
  });
});

describe('day-agenda feature descriptor', () => {
  it('has id "day-agenda"', () => {
    expect(feature.id).toBe('day-agenda');
  });

  it('is registered in the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 10', () => {
    expect(feature.order).toBe(10);
  });

  it('exposes a Component', () => {
    expect(typeof feature.Component).toBe('function');
  });
});
