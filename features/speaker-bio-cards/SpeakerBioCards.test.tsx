import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpeakerBioCards } from './SpeakerBioCards';

const MOCK_RATINGS = {
  'ada-lovelace': { up: 3, down: 1 },
  'grace-hopper': { up: 0, down: 0 },
  'alan-turing': { up: 5, down: 2 },
};

function makeFetchOk(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) };
}

describe('SpeakerBioCards', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetchOk(MOCK_RATINGS)));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the Speakers heading', async () => {
    render(<SpeakerBioCards />);
    expect(screen.getByRole('heading', { name: /speakers/i })).toBeInTheDocument();
    await waitFor(() => expect(vi.mocked(globalThis.fetch)).toHaveBeenCalled());
  });

  it('renders each speaker name', async () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    await waitFor(() => expect(vi.mocked(globalThis.fetch)).toHaveBeenCalled());
  });

  it('renders role and bio for all three speakers', async () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Principal Engineer')).toBeInTheDocument();
    expect(screen.getByText('Compiler Pioneer')).toBeInTheDocument();
    expect(screen.getByText('Research Lead')).toBeInTheDocument();
    expect(screen.getByText(/Wrote the first algorithm/)).toBeInTheDocument();
    expect(screen.getByText(/Invented the first compiler/)).toBeInTheDocument();
    expect(screen.getByText(/Laid the foundations of computation/)).toBeInTheDocument();
    await waitFor(() => expect(vi.mocked(globalThis.fetch)).toHaveBeenCalled());
  });

  it('renders initials avatars for each speaker', async () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('GH')).toBeInTheDocument();
    expect(screen.getByText('AT')).toBeInTheDocument();
    await waitFor(() => expect(vi.mocked(globalThis.fetch)).toHaveBeenCalled());
  });

  it('renders thumbs up and down buttons for all three speakers', async () => {
    render(<SpeakerBioCards />);
    for (const name of ['Ada Lovelace', 'Grace Hopper', 'Alan Turing']) {
      expect(screen.getByRole('button', { name: `Thumbs up for ${name}` })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `Thumbs down for ${name}` })).toBeInTheDocument();
    }
    await waitFor(() => expect(vi.mocked(globalThis.fetch)).toHaveBeenCalled());
  });

  it('shows zero counts before fetch resolves', () => {
    vi.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {}));
    render(<SpeakerBioCards />);
    expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('0');
    expect(screen.getByRole('button', { name: /thumbs down for ada lovelace/i })).toHaveTextContent('0');
  });

  it('updates all vote counts after fetching ratings', async () => {
    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('3');
      expect(screen.getByRole('button', { name: /thumbs down for ada lovelace/i })).toHaveTextContent('1');
      expect(screen.getByRole('button', { name: /thumbs up for alan turing/i })).toHaveTextContent('5');
      expect(screen.getByRole('button', { name: /thumbs down for alan turing/i })).toHaveTextContent('2');
    });
  });

  it('posts a thumbs-up vote and updates the displayed count', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(makeFetchOk(MOCK_RATINGS) as never)
      .mockResolvedValueOnce(makeFetchOk({ up: 4, down: 1 }) as never);

    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('3');
    });

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for ada lovelace/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('4');
    });
    expect(vi.mocked(globalThis.fetch)).toHaveBeenLastCalledWith(
      '/api/speaker-bio-cards',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ speakerId: 'ada-lovelace', vote: 'up' }),
      }),
    );
  });

  it('posts a thumbs-down vote and updates the displayed count', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(makeFetchOk(MOCK_RATINGS) as never)
      .mockResolvedValueOnce(makeFetchOk({ up: 3, down: 2 }) as never);

    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs down for ada lovelace/i })).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByRole('button', { name: /thumbs down for ada lovelace/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs down for ada lovelace/i })).toHaveTextContent('2');
    });
  });

  it('does not update count when POST response is not ok', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(makeFetchOk(MOCK_RATINGS) as never)
      .mockResolvedValueOnce({ ok: false } as never);

    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('3');
    });

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for ada lovelace/i }));

    await waitFor(() => {
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('3');
  });

  it('renders with zero counts and does not crash when GET fetch fails', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));
    render(<SpeakerBioCards />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    // Counts stay at zero after the error is swallowed
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('0');
    });
  });

  it('does not crash and does not update count when POST fetch throws', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(makeFetchOk(MOCK_RATINGS) as never)
      .mockRejectedValueOnce(new Error('Network error'));

    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('3');
    });

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for ada lovelace/i }));

    await waitFor(() => {
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByRole('button', { name: /thumbs up for ada lovelace/i })).toHaveTextContent('3');
  });
});
