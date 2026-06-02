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
});
