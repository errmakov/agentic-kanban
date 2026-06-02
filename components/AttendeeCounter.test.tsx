import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: () => Promise.resolve({ count: 42 }) }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the live viewer count from the presence API', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/42 viewing/)).toBeInTheDocument();
    });
  });

  it('shows 0 viewing before the first beat resolves', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
    );
    render(<AttendeeCounter />);
    expect(screen.getByText(/0 viewing/)).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen reader accessibility', async () => {
    render(<AttendeeCounter />);
    const el = await screen.findByText(/viewing/);
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('does not crash when fetch rejects (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/0 viewing/)).toBeInTheDocument();
    });
  });

  it('stores a viewer ID in localStorage on first render', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/42 viewing/)).toBeInTheDocument();
    });
    expect(localStorage.getItem('fw_viewer_id')).toBeTruthy();
  });

  it('reuses an existing viewer ID from localStorage', async () => {
    const existingId = 'existing-viewer-id';
    localStorage.setItem('fw_viewer_id', existingId);

    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/42 viewing/)).toBeInTheDocument();
    });

    const fetchMock = vi.mocked(fetch);
    const callBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(callBody.id).toBe(existingId);
    expect(localStorage.getItem('fw_viewer_id')).toBe(existingId);
  });

  it('POSTs to /api/presence with the viewer id', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/42 viewing/)).toBeInTheDocument();
    });

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/presence',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const callBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(typeof callBody.id).toBe('string');
    expect(callBody.id.length).toBeGreaterThan(0);
  });
});
