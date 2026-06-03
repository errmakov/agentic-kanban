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

  it('renders each speaker name', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
  });

  it('renders each speaker role', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Keynote Speaker')).toBeInTheDocument();
    expect(screen.getByText('Workshop Host')).toBeInTheDocument();
    expect(screen.getByText('Panelist')).toBeInTheDocument();
  });

  it('renders each speaker bio', () => {
    render(<SpeakerBioCards />);
    expect(
      screen.getByText(/Pioneer of computing/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Compiler trailblazer/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Father of theoretical computer science/i),
    ).toBeInTheDocument();
  });

  it('renders at least 2 speaker cards as list items', () => {
    render(<SpeakerBioCards />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('renders inside a section element', () => {
    const { container } = render(<SpeakerBioCards />);
    expect(container.querySelector('section')).not.toBeNull();
  });
});
