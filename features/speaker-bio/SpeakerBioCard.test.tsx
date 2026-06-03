import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpeakerBioCards } from './index';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () => Promise.resolve({}),
    }),
  );
});

describe('SpeakerBioCards', () => {
  it('renders all speaker names', async () => {
    render(<SpeakerBioCards />);
    expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    expect(screen.getByText('Sam Okonkwo')).toBeInTheDocument();
    expect(screen.getByText('Maya Chen')).toBeInTheDocument();
  });

  it('renders thumbs up and thumbs down buttons for each speaker', async () => {
    render(<SpeakerBioCards />);
    await screen.findByText('Alex Rivera');
    const upButtons = screen.getAllByRole('button', { name: /thumbs up/i });
    const downButtons = screen.getAllByRole('button', { name: /thumbs down/i });
    expect(upButtons).toHaveLength(4);
    expect(downButtons).toHaveLength(4);
  });
});
