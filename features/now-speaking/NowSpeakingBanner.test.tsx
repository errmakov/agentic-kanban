import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import NowSpeaking from './index';

const Banner = NowSpeaking.Component;

function mockFetch(session: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => ({ session }) })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NowSpeakingBanner', () => {
  it('renders the session name when set', async () => {
    mockFetch('Intro to AI Agents');
    render(<Banner />);
    expect(await screen.findByText('Intro to AI Agents')).toBeInTheDocument();
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });

  it('renders nothing when the session is empty', async () => {
    mockFetch('');
    const { container } = render(<Banner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the session is whitespace-only', async () => {
    mockFetch('   ');
    const { container } = render(<Banner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when fetch throws an error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('Network error'); }));
    const { container } = render(<Banner />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the banner section with an accessible name', async () => {
    mockFetch('Workshop Live');
    render(<Banner />);
    const section = await screen.findByRole('region', { name: /now speaking/i });
    expect(section).toBeInTheDocument();
  });

  it('exports id, slot, and order on the feature descriptor', () => {
    expect(NowSpeaking.id).toBe('now-speaking');
    expect(NowSpeaking.slot).toBe('main');
    expect(NowSpeaking.order).toBe(0);
  });
});
