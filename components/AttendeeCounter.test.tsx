import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        const body =
          init?.method === 'POST' ? { ok: true } : { count: 5 };
        return Promise.resolve({ json: () => Promise.resolve(body) });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the loading placeholder before the first fetch resolves', () => {
    render(<AttendeeCounter />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the viewer count once the fetch resolves', async () => {
    render(<AttendeeCounter />);
    await waitFor(() => {
      expect(screen.getByText('5 watching')).toBeInTheDocument();
    });
  });
});
