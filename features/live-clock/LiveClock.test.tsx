import { render, screen, act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const { Component: LiveClock } = feature;

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the current time after mount', () => {
    render(<LiveClock />);
    const expected = new Date('2026-01-01T12:00:00').toLocaleTimeString();
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('updates the displayed time every second', () => {
    render(<LiveClock />);
    expect(
      screen.getByText(new Date('2026-01-01T12:00:00').toLocaleTimeString()),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByText(new Date('2026-01-01T12:00:01').toLocaleTimeString()),
    ).toBeInTheDocument();
  });

  it('renders a <time> element with a valid dateTime attribute', () => {
    render(<LiveClock />);
    const el = screen.getByText(
      new Date('2026-01-01T12:00:00').toLocaleTimeString(),
    );
    expect(el.tagName).toBe('TIME');
    expect(el.getAttribute('dateTime')).toBe(
      new Date('2026-01-01T12:00:00').toISOString(),
    );
  });

  it('renders ——:——:—— placeholder in server-rendered output (no hydration mismatch)', () => {
    const html = renderToString(<LiveClock />);
    expect(html).toContain('——:——:——');
  });

  it('clears the interval on unmount', () => {
    const { unmount } = render(<LiveClock />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('feature descriptor', () => {
  it('has id "live-clock"', () => {
    expect(feature.id).toBe('live-clock');
  });

  it('is registered in the header slot', () => {
    expect(feature.slot).toBe('header');
  });

  it('has order 20', () => {
    expect(feature.order).toBe(20);
  });

  it('exports a Component', () => {
    expect(typeof feature.Component).toBe('function');
  });
});
