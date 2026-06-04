import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const { Component: AttendeeCounter } = feature;

describe('AttendeeCounter', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) =>
        Promise.resolve({
          json: () =>
            Promise.resolve(init?.method === 'POST' ? { ok: true } : { count: 42 }),
        } as Response),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('renders the live viewer count after fetching', async () => {
    render(<AttendeeCounter />);
    expect(await screen.findByText(/42 watching/)).toBeInTheDocument();
  });
});
