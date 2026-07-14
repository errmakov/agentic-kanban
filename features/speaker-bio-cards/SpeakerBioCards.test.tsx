import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpeakerBioCards } from './SpeakerBioCards';

describe('SpeakerBioCards', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              'ada-lovelace': { up: 3, down: 1 },
              'grace-hopper': { up: 0, down: 0 },
              'alan-turing': { up: 5, down: 2 },
            }),
        }),
      ),
    );
  });

  it('renders each speaker name', async () => {
    render(<SpeakerBioCards />);
    expect(screen.getByRole('heading', { name: /speakers/i })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
  });

  it('renders thumbs up and down buttons for each speaker', async () => {
    render(<SpeakerBioCards />);
    expect(
      screen.getByRole('button', { name: /thumbs up for ada lovelace/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /thumbs down for ada lovelace/i }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /thumbs up for ada lovelace/i }),
      ).toHaveTextContent('3');
    });
  });
});
