import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import countdown from './index';

const Countdown = countdown.Component;

function mockFetch(state: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => state })) as unknown as typeof fetch,
  );
}

function makeTrackingFetch(state: unknown) {
  const mock = vi.fn(async () => ({ json: async () => state }));
  vi.stubGlobal('fetch', mock as unknown as typeof fetch);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Countdown', () => {
  it('shows the +Countdown button when idle', async () => {
    mockFetch({ state: 'idle' });
    await act(async () => {
      render(<Countdown />);
    });
    expect(screen.getByRole('button', { name: '+Countdown' })).toBeInTheDocument();
  });

  it("shows \"Time's up!\" when finished", async () => {
    mockFetch({ state: 'finished' });
    await act(async () => {
      render(<Countdown />);
    });
    expect(screen.getByText(/time's up/i)).toBeInTheDocument();
  });

  it('renders a MM:SS time string when running', async () => {
    mockFetch({ state: 'running', endsAt: Date.now() + 60_000 });
    await act(async () => {
      render(<Countdown />);
    });
    expect(screen.getByLabelText('time remaining').textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it('clicking +Countdown reveals the MM and SS inputs', async () => {
    mockFetch({ state: 'idle' });
    await act(async () => {
      render(<Countdown />);
    });
    fireEvent.click(screen.getByRole('button', { name: '+Countdown' }));
    expect(screen.getByLabelText('minutes')).toBeInTheDocument();
    expect(screen.getByLabelText('seconds')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Cancel button hides the form and restores the +Countdown button', async () => {
    mockFetch({ state: 'idle' });
    await act(async () => {
      render(<Countdown />);
    });
    fireEvent.click(screen.getByRole('button', { name: '+Countdown' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: '+Countdown' })).toBeInTheDocument();
    expect(screen.queryByLabelText('minutes')).not.toBeInTheDocument();
  });

  it('submitting the form POSTs the correct durationMs', async () => {
    const fetchMock = makeTrackingFetch({ state: 'idle' });
    await act(async () => {
      render(<Countdown />);
    });
    fireEvent.click(screen.getByRole('button', { name: '+Countdown' }));
    fireEvent.change(screen.getByLabelText('minutes'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('seconds'), { target: { value: '30' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    });
    const postCall = fetchMock.mock.calls.find((call) => call[1]?.method === 'POST');
    expect(postCall).toBeDefined();
    expect(JSON.parse(postCall![1].body as string)).toEqual({
      action: 'start',
      durationMs: 90_000,
    });
  });

  it('zero-duration input (0:00) does not POST', async () => {
    const fetchMock = makeTrackingFetch({ state: 'idle' });
    await act(async () => {
      render(<Countdown />);
    });
    fireEvent.click(screen.getByRole('button', { name: '+Countdown' }));
    // leave inputs empty — defaults to 0 minutes, 0 seconds
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    });
    const postCalls = fetchMock.mock.calls.filter((call) => call[1]?.method === 'POST');
    expect(postCalls).toHaveLength(0);
  });

  it('running state shows a Reset button alongside the timer', async () => {
    mockFetch({ state: 'running', endsAt: Date.now() + 60_000 });
    await act(async () => {
      render(<Countdown />);
    });
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    expect(screen.getByLabelText('time remaining')).toBeInTheDocument();
  });

  it('finished state shows a Reset button alongside Time\'s up', async () => {
    mockFetch({ state: 'finished' });
    await act(async () => {
      render(<Countdown />);
    });
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    expect(screen.getByText(/time's up/i)).toBeInTheDocument();
  });

  it('clicking Reset in running state POSTs reset action', async () => {
    const fetchMock = makeTrackingFetch({ state: 'running', endsAt: Date.now() + 60_000 });
    await act(async () => {
      render(<Countdown />);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    });
    const postCall = fetchMock.mock.calls.find((call) => call[1]?.method === 'POST');
    expect(postCall).toBeDefined();
    expect(JSON.parse(postCall![1].body as string)).toEqual({ action: 'reset' });
  });

  it('clicking Reset in finished state POSTs reset action', async () => {
    const fetchMock = makeTrackingFetch({ state: 'finished' });
    await act(async () => {
      render(<Countdown />);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    });
    const postCall = fetchMock.mock.calls.find((call) => call[1]?.method === 'POST');
    expect(postCall).toBeDefined();
    expect(JSON.parse(postCall![1].body as string)).toEqual({ action: 'reset' });
  });

  it('feature descriptor has correct id, slot and order', () => {
    expect(countdown.id).toBe('countdown');
    expect(countdown.slot).toBe('main');
    expect(countdown.order).toBe(50);
  });
});
