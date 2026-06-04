import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpeakerBioCards } from './SpeakerBioCards';

function mockFetch(getResponse: object, postResponse?: object) {
  let callCount = 0;
  return vi.fn().mockImplementation(() => {
    callCount++;
    const isPost = callCount > 1 && postResponse !== undefined;
    const data = isPost ? postResponse : getResponse;
    return Promise.resolve({ json: () => Promise.resolve(data) });
  });
}

describe('SpeakerBioCards', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the Speakers heading', async () => {
    await act(async () => { render(<SpeakerBioCards />); });
    expect(screen.getByRole('heading', { name: /speakers/i })).toBeInTheDocument();
  });

  it('renders all three speaker names', async () => {
    await act(async () => { render(<SpeakerBioCards />); });
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Sam Chen')).toBeInTheDocument();
    expect(screen.getByText('Jordan Kim')).toBeInTheDocument();
  });

  it('renders all three speaker roles', async () => {
    await act(async () => { render(<SpeakerBioCards />); });
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('DevOps Lead')).toBeInTheDocument();
  });

  it('renders vote buttons for each speaker', async () => {
    await act(async () => { render(<SpeakerBioCards />); });
    expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thumbs down for alex rivera/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thumbs up for sam chen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thumbs up for jordan kim/i })).toBeInTheDocument();
  });

  it('fetches tallies from the API on mount', async () => {
    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/speaker-bio-cards');
    });
  });

  it('applies fetched tallies to speaker cards', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ 'alex-rivera': { up: 7, down: 3 } }),
    });
    render(<SpeakerBioCards />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toHaveTextContent('7');
      expect(screen.getByRole('button', { name: /thumbs down for alex rivera/i })).toHaveTextContent('3');
    });
  });

  it('defaults to zero tallies before fetch resolves', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<SpeakerBioCards />);
    expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toHaveTextContent('0');
  });

  it('applies optimistic update when thumbs-up is clicked', async () => {
    global.fetch = mockFetch(
      {},
      { speakerId: 'alex-rivera', tally: { up: 1, down: 0 } },
    );
    await act(async () => { render(<SpeakerBioCards />); });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /thumbs up for alex rivera/i }));
    });

    expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toHaveTextContent('1');
  });

  it('reconciles tally with server response after POST', async () => {
    global.fetch = mockFetch(
      {},
      { speakerId: 'alex-rivera', tally: { up: 5, down: 0 } },
    );
    render(<SpeakerBioCards />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for alex rivera/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toHaveTextContent('5');
    });
  });

  it('rolls back optimistic update when POST fails', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({}) })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<SpeakerBioCards />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for alex rivera/i }));
    expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toHaveTextContent('1');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toHaveTextContent('0');
    });
  });

  it('silently ignores fetch errors on mount', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<SpeakerBioCards />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toHaveTextContent('0');
  });
});
