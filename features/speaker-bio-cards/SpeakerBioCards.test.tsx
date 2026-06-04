import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpeakerCard } from './SpeakerCard';
import type { Speaker } from './speakers';

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

  it('calls onVote with the right direction when buttons are clicked', () => {
    const onVote = vi.fn();
    render(<SpeakerCard speaker={speaker} up={0} down={0} onVote={onVote} />);

    fireEvent.click(screen.getByRole('button', { name: /thumbs up for alice mercer/i }));
    expect(onVote).toHaveBeenCalledWith('up');

    fireEvent.click(screen.getByRole('button', { name: /thumbs down for alice mercer/i }));
    expect(onVote).toHaveBeenCalledWith('down');
  });
});
