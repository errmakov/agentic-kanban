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

  it('shows the "Now Speaking" label when a title is present', async () => {
    vi.stubGlobal('fetch', mockFetch('Workshop: Build in Public'));
    render(<Banner />);
    expect(await screen.findByText('Now Speaking')).toBeInTheDocument();
  });

  it('section carries the correct aria-label', async () => {
    vi.stubGlobal('fetch', mockFetch('My Session'));
    render(<Banner />);
    const section = await screen.findByRole('region', { name: /now speaking/i });
    expect(section).toBeInTheDocument();
  });

  it('renders nothing when the API returns a non-string title', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: async () => ({ title: null }),
    }));
    const { container } = render(<Banner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container.querySelector('section')).toBeNull();
  });

  it('renders nothing and does not throw when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const { container } = render(<Banner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container.querySelector('section')).toBeNull();
  });

  it('exports the correct feature descriptor', () => {
    expect(nowSpeaking.id).toBe('now-speaking');
    expect(nowSpeaking.slot).toBe('main');
    expect(nowSpeaking.order).toBe(10);
    expect(nowSpeaking.Component).toBe(Banner);
  });
});
