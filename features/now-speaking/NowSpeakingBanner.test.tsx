import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import nowSpeaking from './index';

const { Component: NowSpeakingBanner } = nowSpeaking;

function mockFetch(session: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ session }),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('NowSpeakingBanner', () => {
  it('renders nothing when the session name is empty', async () => {
    mockFetch('');
    const { container } = render(<NowSpeakingBanner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the session name when it is set', async () => {
    mockFetch('Designing the Agent Pipeline');
    render(<NowSpeakingBanner />);
    expect(
      await screen.findByText('Designing the Agent Pipeline'),
    ).toBeInTheDocument();
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });
});
