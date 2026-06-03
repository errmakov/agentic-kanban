import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const AttendeeCounter = feature.Component;

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 42 }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('renders the count returned by the API', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => expect(screen.getByText(/42 watching/)).toBeInTheDocument());
  });

  it('shows a placeholder before the first response', () => {
    render(<AttendeeCounter />);
    expect(screen.getByText(/– watching/)).toBeInTheDocument();
  });

  it('keeps showing placeholder when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<AttendeeCounter />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/– watching/)).toBeInTheDocument();
  });

  it('keeps showing placeholder when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ count: 99 }) }),
    );
    render(<AttendeeCounter />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/– watching/)).toBeInTheDocument();
  });

  it('stores a new session ID in sessionStorage on mount', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => expect(sessionStorage.getItem('fw-session-id')).not.toBeNull());
  });

  it('sends the stored session ID in the POST body', async () => {
    sessionStorage.setItem('fw-session-id', 'test-session-xyz');
    render(<AttendeeCounter />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [, opts] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse((opts as RequestInit).body as string) as { sessionId: string };
    expect(body.sessionId).toBe('test-session-xyz');
  });

  it('POSTs to /api/attendee-counter', async () => {
    render(<AttendeeCounter />);
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/attendee-counter',
        expect.objectContaining({ method: 'POST' }),
      ),
    );
  });

  it('sends Content-Type application/json', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [, opts] = vi.mocked(fetch).mock.calls[0];
    expect((opts as RequestInit).headers).toMatchObject({
      'Content-Type': 'application/json',
    });
  });
});

describe('feature descriptor', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('attendee-counter');
    expect(feature.slot).toBe('header');
    expect(feature.order).toBe(10);
  });
});
