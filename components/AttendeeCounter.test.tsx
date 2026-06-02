import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows — placeholder before the first API response', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<AttendeeCounter />);
    expect(screen.getByLabelText('live viewer count')).toHaveTextContent('— viewing');
  });

  it('renders the live viewer count from the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 7 }) }),
    );
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByLabelText('live viewer count')).toHaveTextContent('7 viewing');
    });
  });

  it('generates and persists a sessionId in localStorage when none exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 1 }) }),
    );
    render(<AttendeeCounter />);
    await waitFor(() =>
      expect(screen.getByLabelText('live viewer count')).toHaveTextContent('1 viewing'),
    );
    expect(localStorage.getItem('fw-session-id')).toBeTruthy();
  });

  it('reuses an existing sessionId from localStorage', async () => {
    const storedId = 'existing-test-session';
    localStorage.setItem('fw-session-id', storedId);
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 3 }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AttendeeCounter />);
    await waitFor(() =>
      expect(screen.getByLabelText('live viewer count')).toHaveTextContent('3 viewing'),
    );
    const sentBody = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(sentBody.sessionId).toBe(storedId);
  });

  it('keeps showing — when the initial fetch fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', fetchMock);
    render(<AttendeeCounter />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByLabelText('live viewer count')).toHaveTextContent('— viewing');
  });
});
