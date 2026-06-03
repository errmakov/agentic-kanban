import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import nowSpeaking from './index';

const Banner = nowSpeaking.Component;

function mockFetch(title: string) {
  return vi.fn().mockResolvedValue({
    json: async () => ({ title }),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('NowSpeakingBanner', () => {
  it('renders the session title when one is set', async () => {
    vi.stubGlobal('fetch', mockFetch('Keynote: AI on Stage'));
    render(<Banner />);
    expect(await screen.findByText('Keynote: AI on Stage')).toBeInTheDocument();
  });

  it('renders nothing when the title is empty', async () => {
    vi.stubGlobal('fetch', mockFetch(''));
    const { container } = render(<Banner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container.querySelector('section')).toBeNull();
  });
});
