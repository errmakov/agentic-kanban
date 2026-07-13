import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import feature from './index';
import { SPEAKERS } from './speakers';

const SpeakerBioCards = feature.Component;

describe('SpeakerBioCards', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({ tallies: { 'alice-nguyen': { up: 3, down: 1 } } }),
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('renders every speaker name and role', async () => {
    render(<SpeakerBioCards />);
    for (const speaker of SPEAKERS) {
      expect(screen.getByText(speaker.name)).toBeInTheDocument();
      expect(screen.getByText(speaker.role)).toBeInTheDocument();
    }
  });

  it('renders thumbs up/down buttons for each speaker', () => {
    render(<SpeakerBioCards />);
    for (const speaker of SPEAKERS) {
      expect(
        screen.getByRole('button', { name: `Thumbs up for ${speaker.name}` }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: `Thumbs down for ${speaker.name}` }),
      ).toBeInTheDocument();
    }
  });

  it('shows fetched tallies once the GET resolves', async () => {
    render(<SpeakerBioCards />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('optimistically increments and updates to the server tally on vote', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                speakerId: 'alice-nguyen',
                tally: { up: 10, down: 1 },
              }),
          });
        }
        return Promise.resolve({
          json: () =>
            Promise.resolve({ tallies: { 'alice-nguyen': { up: 3, down: 1 } } }),
        });
      }),
    );

    render(<SpeakerBioCards />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    fireEvent.click(
      screen.getByRole('button', { name: 'Thumbs up for Alice Nguyen' }),
    );

    expect(screen.getByText('4')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
  });

  it('disables both buttons for a speaker after voting', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                speakerId: 'alice-nguyen',
                tally: { up: 4, down: 1 },
              }),
          });
        }
        return Promise.resolve({
          json: () =>
            Promise.resolve({ tallies: { 'alice-nguyen': { up: 3, down: 1 } } }),
        });
      }),
    );

    render(<SpeakerBioCards />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    const up = screen.getByRole('button', { name: 'Thumbs up for Alice Nguyen' });
    const down = screen.getByRole('button', {
      name: 'Thumbs down for Alice Nguyen',
    });
    fireEvent.click(up);

    await waitFor(() => expect(up).toBeDisabled());
    expect(down).toBeDisabled();
  });

  it('rolls back and re-enables buttons when the POST fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'POST') {
          return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
        }
        return Promise.resolve({
          json: () =>
            Promise.resolve({ tallies: { 'alice-nguyen': { up: 3, down: 1 } } }),
        });
      }),
    );

    render(<SpeakerBioCards />);
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());

    const up = screen.getByRole('button', { name: 'Thumbs up for Alice Nguyen' });
    fireEvent.click(up);
    expect(screen.getByText('4')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
    expect(up).not.toBeDisabled();
  });
});

describe('feature descriptor', () => {
  it('has the correct id, slot, and order', () => {
    expect(feature.id).toBe('speaker-bio-cards');
    expect(feature.slot).toBe('main');
    expect(feature.order).toBe(50);
  });
});
