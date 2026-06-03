import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NowSpeaking from './index';

const Component = NowSpeaking.Component;

function mockFetch(session: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => ({ session }) })),
  );
}

describe('NowSpeaking', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders no banner when the session is empty', async () => {
    mockFetch('');
    render(<Component />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/now speaking/i)).not.toBeInTheDocument();
  });

  it('renders the session name in the banner when one is set', async () => {
    mockFetch('Intro to Agentic Systems');
    render(<Component />);
    expect(
      await screen.findByText('Intro to Agentic Systems'),
    ).toBeInTheDocument();
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });
});
