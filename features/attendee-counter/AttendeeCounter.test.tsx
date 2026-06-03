import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttendeeCounter } from './index';

describe('AttendeeCounter', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a placeholder before the first response, then the count', async () => {
    let resolve: (value: { count: number }) => void = () => {};
    const pending = new Promise<{ count: number }>((r) => {
      resolve = r;
    });
    const fetchMock = vi.fn(() => Promise.resolve({ json: () => pending }));
    vi.stubGlobal('fetch', fetchMock);

    render(<AttendeeCounter />);
    expect(screen.getByText(/… watching/)).toBeInTheDocument();

    resolve({ count: 42 });
    await waitFor(() =>
      expect(screen.getByText(/42 watching/)).toBeInTheDocument(),
    );
  });
});
