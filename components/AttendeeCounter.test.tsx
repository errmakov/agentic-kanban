import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

const STORAGE_KEY = 'fw-viewer-id';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ count: 5 }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('renders the live viewer count after fetching', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText(/5 viewing/i)).toBeInTheDocument();
    });
  });

  it('renders nothing before the first fetch resolves', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})) as unknown as typeof fetch;
    const { container } = render(<AttendeeCounter />);
    expect(container).toBeEmptyDOMElement();
  });

  it('reuses an existing session ID from sessionStorage', async () => {
    sessionStorage.setItem(STORAGE_KEY, 'my-existing-id');
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=my-existing-id'),
      );
    });
  });

  it('creates and stores a new session ID when none exists', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`id=${sessionStorage.getItem(STORAGE_KEY)}`),
    );
  });

  it('does not render a count when fetch throws a network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch;
    render(<AttendeeCounter />);
    await act(async () => {
      await vi.waitFor(() => expect(global.fetch).toHaveBeenCalled());
    });
    expect(screen.queryByText(/viewing/i)).not.toBeInTheDocument();
  });

  it('applies the expected text style classes', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      const el = screen.getByText(/5 viewing/i);
      expect(el).toHaveClass('text-sm', 'text-neutral-500');
    });
  });
});
