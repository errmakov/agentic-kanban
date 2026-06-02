import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BreakCountdown } from './BreakCountdown';

const NOW = new Date('2026-06-02T12:00:00.000Z').getTime();

function mockBreak(breakAt: string | null) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ json: async () => ({ breakAt }) }),
  );
}

// Flush the pending fetch().then().then() microtask chain.
async function flushFetch() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('BreakCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders nothing when breakAt is null', async () => {
    mockBreak(null);
    const { container } = render(<BreakCountdown />);
    await flushFetch();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the countdown when a future break time is provided', async () => {
    mockBreak(new Date(NOW + 3 * 60 * 1000).toISOString());
    render(<BreakCountdown />);
    await flushFetch();
    expect(screen.getByText('3:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('2:59')).toBeInTheDocument();
  });

  it('shows "Break time!" when the timer reaches zero', async () => {
    mockBreak(new Date(NOW + 2 * 1000).toISOString());
    render(<BreakCountdown />);
    await flushFetch();
    expect(screen.getByText('0:02')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Break time!')).toBeInTheDocument();
  });

  it('renders HH:MM:SS format for countdowns over one hour', async () => {
    const ms = (1 * 3600 + 30 * 60 + 5) * 1000;
    mockBreak(new Date(NOW + ms).toISOString());
    render(<BreakCountdown />);
    await flushFetch();
    expect(screen.getByText('1:30:05')).toBeInTheDocument();
  });

  it('renders nothing when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    const { container } = render(<BreakCountdown />);
    await flushFetch();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the "Next break in" label alongside the countdown', async () => {
    mockBreak(new Date(NOW + 5 * 60 * 1000).toISOString());
    render(<BreakCountdown />);
    await flushFetch();
    expect(screen.getByText(/next break in/i)).toBeInTheDocument();
  });

  it('has the correct accessible region label', async () => {
    mockBreak(new Date(NOW + 5 * 60 * 1000).toISOString());
    render(<BreakCountdown />);
    await flushFetch();
    expect(
      screen.getByRole('region', { name: /countdown to next break/i }),
    ).toBeInTheDocument();
  });
});
