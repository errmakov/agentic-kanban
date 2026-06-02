import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NowSpeakingBanner } from './NowSpeakingBanner';

function mockFetch(name: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ json: () => Promise.resolve({ name }) }),
  );
}

describe('NowSpeakingBanner', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the session name when one is set', async () => {
    mockFetch('Intro to AI Agents');
    render(<NowSpeakingBanner />);
    expect(await screen.findByText('Intro to AI Agents')).toBeInTheDocument();
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });

  it('renders nothing when the session name is empty', async () => {
    mockFetch('');
    const { container } = render(<NowSpeakingBanner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
