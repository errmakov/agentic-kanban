import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpeakerCard } from './SpeakerCard';
import type { Speaker } from './speakers';
import { SPEAKERS } from './speakers';
import feature from './index';

const { Component: SpeakerBioCards } = feature;

const speaker: Speaker = {
  id: 'alice-mercer',
  name: 'Alice Mercer',
  role: 'Principal Engineer, Acme Cloud',
  bio: 'Builds resilient distributed systems.',
};

describe('SpeakerCard', () => {
  it('renders the speaker name, role, and bio', () => {
    render(<SpeakerCard speaker={speaker} up={3} down={1} onVote={() => {}} />);
    expect(screen.getByRole('heading', { name: /alice mercer/i })).toBeInTheDocument();
    expect(screen.getByText(/principal engineer, acme cloud/i)).toBeInTheDocument();
    expect(screen.getByText(/builds resilient distributed systems/i)).toBeInTheDocument();
  });

  it('shows the up and down tallies', () => {
    render(<SpeakerCard speaker={speaker} up={3} down={1} onVote={() => {}} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows zero counts when tallies are 0', () => {
    render(<SpeakerCard speaker={speaker} up={0} down={0} onVote={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('0');
    expect(buttons[1]).toHaveTextContent('0');
  });

  it('calls onVote with the right direction when buttons are clicked', () => {
    const onVote = vi.fn();
    render(<SpeakerCard speaker={speaker} up={0} down={0} onVote={onVote} />);

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for alice mercer/i }));
    expect(onVote).toHaveBeenCalledWith('up');

    fireEvent.click(screen.getByRole('button', { name: /thumbs down for alice mercer/i }));
    expect(onVote).toHaveBeenCalledWith('down');
  });

  it('does not call onVote for the other button when one is clicked', () => {
    const onVote = vi.fn();
    render(<SpeakerCard speaker={speaker} up={0} down={0} onVote={onVote} />);
    fireEvent.click(screen.getByRole('button', { name: /thumbs up for alice mercer/i }));
    expect(onVote).toHaveBeenCalledTimes(1);
    expect(onVote).not.toHaveBeenCalledWith('down');
  });

  it('uses the speaker name in button aria-labels', () => {
    const other: Speaker = { id: 'ben-ortiz', name: 'Ben Ortiz', role: 'Dev Advocate', bio: 'Short bio.' };
    render(<SpeakerCard speaker={other} up={0} down={0} onVote={() => {}} />);
    expect(screen.getByRole('button', { name: /thumbs up for ben ortiz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thumbs down for ben ortiz/i })).toBeInTheDocument();
  });
});

function mockResponse(data: unknown, ok = true): Response {
  return { ok, json: () => Promise.resolve(data) } as unknown as Response;
}

describe('SpeakerBioCards', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({})));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the "Meet the Speakers" heading', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByRole('heading', { name: /meet the speakers/i })).toBeInTheDocument();
  });

  it('renders a card for every speaker in the static list', () => {
    render(<SpeakerBioCards />);
    for (const s of SPEAKERS) {
      expect(screen.getByRole('heading', { name: new RegExp(s.name, 'i') })).toBeInTheDocument();
    }
  });

  it('renders all three speakers (regression: list is not empty)', () => {
    render(<SpeakerBioCards />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('fetches tallies from the API on mount and passes them to cards', async () => {
    const tallies = {
      'alice-mercer': { up: 7, down: 2 },
      'ben-ortiz': { up: 0, down: 0 },
      'chen-wei': { up: 4, down: 1 },
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse(tallies));
    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for alice mercer/i })).toHaveTextContent('7');
    });
    expect(screen.getByRole('button', { name: /thumbs down for alice mercer/i })).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: /thumbs up for chen wei/i })).toHaveTextContent('4');
  });

  it('starts with zero tallies before the API responds', () => {
    vi.mocked(global.fetch).mockReturnValueOnce(new Promise(() => undefined));
    render(<SpeakerBioCards />);
    expect(screen.getByRole('button', { name: /thumbs up for alice mercer/i })).toHaveTextContent('0');
  });

  it('optimistically increments the tally when a vote button is clicked', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockResponse({ 'alice-mercer': { up: 3, down: 1 } }))
      .mockResolvedValueOnce(mockResponse({ up: 4, down: 1 }));

    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for alice mercer/i })).toHaveTextContent('3');
    });

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for alice mercer/i }));
    expect(screen.getByRole('button', { name: /thumbs up for alice mercer/i })).toHaveTextContent('4');
  });

  it('does not change another card\'s tallies when one card is voted on', async () => {
    const tallies = {
      'alice-mercer': { up: 2, down: 0 },
      'ben-ortiz': { up: 5, down: 3 },
      'chen-wei': { up: 0, down: 0 },
    };
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(mockResponse(tallies))
      .mockResolvedValueOnce(mockResponse({ up: 3, down: 0 }));

    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for ben ortiz/i })).toHaveTextContent('5');
    });

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for alice mercer/i }));
    expect(screen.getByRole('button', { name: /thumbs up for ben ortiz/i })).toHaveTextContent('5');
    expect(screen.getByRole('button', { name: /thumbs down for ben ortiz/i })).toHaveTextContent('3');
  });
});
