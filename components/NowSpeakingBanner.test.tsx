import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NowSpeakingBanner } from './NowSpeakingBanner';

function mockFetch(session: string | null) {
  return vi.fn().mockResolvedValue({
    json: async () => ({ session }),
  });
}

describe('NowSpeakingBanner', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the session name when one is set', async () => {
    vi.stubGlobal('fetch', mockFetch('Opening Keynote'));
    render(<NowSpeakingBanner />);
    expect(await screen.findByText(/Opening Keynote/i)).toBeInTheDocument();
  });

  it('renders nothing when session is null', async () => {
    vi.stubGlobal('fetch', mockFetch(null));
    const { container } = render(<NowSpeakingBanner />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });
});
