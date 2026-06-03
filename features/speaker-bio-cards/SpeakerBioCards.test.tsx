import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpeakerBioCards } from './SpeakerBioCards';

describe('SpeakerBioCards', () => {
  it('renders the Speakers heading', () => {
    render(<SpeakerBioCards />);
    expect(
      screen.getByRole('heading', { name: /speakers/i }),
    ).toBeInTheDocument();
  });

  it('renders each speaker name and role', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.getByText('Keynote Speaker')).toBeInTheDocument();
  });
});
