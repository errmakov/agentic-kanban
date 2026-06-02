import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NowSpeakingBanner } from './NowSpeakingBanner';

function mockFetch(session: string | null) {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({ session }),
  }) as unknown as typeof fetch;
}

describe('NowSpeakingBanner', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the session name when one is set', async () => {
    mockFetch('Intro to AI Agents');
    render(<NowSpeakingBanner />);
    expect(await screen.findByText('Intro to AI Agents')).toBeInTheDocument();
  });

  it('renders nothing when no session is set', async () => {
    mockFetch(null);
    const { container } = render(<NowSpeakingBanner />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
