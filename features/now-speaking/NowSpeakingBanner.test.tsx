import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NowSpeakingBanner } from './index';

function mockFetch(session: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ json: () => Promise.resolve({ session }) }),
  );
}

describe('NowSpeakingBanner', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the session name when one is set', async () => {
    mockFetch('Keynote: AI on the Factory Floor');
    render(<NowSpeakingBanner />);
    expect(
      await screen.findByText('Keynote: AI on the Factory Floor'),
    ).toBeInTheDocument();
    expect(screen.getByText(/now speaking:/i)).toBeInTheDocument();
  });

  it('renders nothing when the session is empty', async () => {
    mockFetch('');
    const { container } = render(<NowSpeakingBanner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
