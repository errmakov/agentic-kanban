import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpeakerBioCards } from './index';
import feature from './index';

function makeFetch(initialTallies: Record<string, unknown> = {}) {
  return vi.fn((url: string, opts?: RequestInit) => {
    if ((opts as RequestInit | undefined)?.method === 'POST') {
      return new Promise(() => {}); // hangs so optimistic update stays visible
    }
    return Promise.resolve({ json: () => Promise.resolve(initialTallies) });
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', makeFetch());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SpeakerBioCards', () => {
  it('renders all speaker names', async () => {
    render(<SpeakerBioCards />);
    expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    expect(screen.getByText('Sam Okonkwo')).toBeInTheDocument();
    expect(screen.getByText('Maya Chen')).toBeInTheDocument();
  });

  it('renders each speaker role', async () => {
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    expect(screen.getByText('Staff Engineer, Distributed Systems')).toBeInTheDocument();
    expect(screen.getByText('Principal Product Designer')).toBeInTheDocument();
    expect(screen.getByText('Developer Advocate')).toBeInTheDocument();
    expect(screen.getByText('AI/ML Engineer')).toBeInTheDocument();
  });

  it('renders thumbs up and thumbs down buttons for each speaker', async () => {
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    expect(screen.getAllByRole('button', { name: /thumbs up/i })).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: /thumbs down/i })).toHaveLength(4);
  });

  it('shows zero counts initially when API returns empty tallies', async () => {
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    screen
      .getAllByRole('button', { name: /thumbs up/i })
      .forEach((btn) => expect(btn).toHaveTextContent('0'));
    screen
      .getAllByRole('button', { name: /thumbs down/i })
      .forEach((btn) => expect(btn).toHaveTextContent('0'));
  });

  it('displays tallies fetched from the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ 'alex-rivera': { up: 7, down: 2 } }),
      }),
    );
    render(<SpeakerBioCards />);
    const upBtn = await screen.findByRole('button', { name: /thumbs up for alex rivera/i });
    await waitFor(() => expect(upBtn).toHaveTextContent('7'));
    expect(screen.getByRole('button', { name: /thumbs down for alex rivera/i })).toHaveTextContent(
      '2',
    );
  });

  it('optimistically increments thumbs-up count before POST resolves', async () => {
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    const upBtn = screen.getByRole('button', { name: /thumbs up for alex rivera/i });
    expect(upBtn).toHaveTextContent('0');
    fireEvent.click(upBtn);
    await waitFor(() => expect(upBtn).toHaveTextContent('1'));
  });

  it('optimistically increments thumbs-down count before POST resolves', async () => {
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    const downBtn = screen.getByRole('button', { name: /thumbs down for priya nair/i });
    expect(downBtn).toHaveTextContent('0');
    fireEvent.click(downBtn);
    await waitFor(() => expect(downBtn).toHaveTextContent('1'));
  });

  it('only increments the clicked speaker tally, not others', async () => {
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    const alexUp = screen.getByRole('button', { name: /thumbs up for alex rivera/i });
    const priyaUp = screen.getByRole('button', { name: /thumbs up for priya nair/i });
    fireEvent.click(alexUp);
    await waitFor(() => expect(alexUp).toHaveTextContent('1'));
    expect(priyaUp).toHaveTextContent('0');
  });

  it('reconciles tallies with the server response after POST', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if ((opts as RequestInit | undefined)?.method === 'POST') {
          return Promise.resolve({
            json: () => Promise.resolve({ 'alex-rivera': { up: 10, down: 0 } }),
          });
        }
        return Promise.resolve({ json: () => Promise.resolve({}) });
      }),
    );
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    const upBtn = screen.getByRole('button', { name: /thumbs up for alex rivera/i });
    fireEvent.click(upBtn);
    await waitFor(() => expect(upBtn).toHaveTextContent('10'));
  });

  it('has accessible aria-labels on vote buttons', async () => {
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    expect(
      screen.getByRole('button', { name: 'Thumbs up for Alex Rivera' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Thumbs down for Sam Okonkwo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Thumbs down for Maya Chen' }),
    ).toBeInTheDocument();
  });
});

describe('feature descriptor', () => {
  it('has id "speaker-bio"', () => {
    expect(feature.id).toBe('speaker-bio');
  });

  it('is placed in the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 50', () => {
    expect(feature.order).toBe(50);
  });

  it('exports SpeakerBioCards as the Component', () => {
    expect(feature.Component).toBe(SpeakerBioCards);
  });
});
