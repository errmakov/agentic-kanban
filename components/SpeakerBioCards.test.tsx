import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpeakerBioCards } from './SpeakerBioCards';

describe('SpeakerBioCards', () => {
  it('renders the "Speakers" section heading', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByRole('heading', { name: /speakers/i, level: 2 })).toBeInTheDocument();
  });

  it('renders at least two speaker name headings', () => {
    render(<SpeakerBioCards />);
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('renders Ada Okafor with her role and bio', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByRole('heading', { name: /ada okafor/i })).toBeInTheDocument();
    expect(screen.getByText(/principal engineer, platform/i)).toBeInTheDocument();
    expect(screen.getByText(/resilient developer tooling/i)).toBeInTheDocument();
  });

  it('renders Mateo Rossi with his role and bio', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByRole('heading', { name: /mateo rossi/i })).toBeInTheDocument();
    expect(screen.getByText(/staff ai researcher/i)).toBeInTheDocument();
    expect(screen.getByText(/agentic systems/i)).toBeInTheDocument();
  });

  it('renders Priya Nair with her role and bio', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByRole('heading', { name: /priya nair/i })).toBeInTheDocument();
    expect(screen.getByText(/head of developer experience/i)).toBeInTheDocument();
    expect(screen.getByText(/fast feedback loops/i)).toBeInTheDocument();
  });

  it('section is labelled by the speakers heading for accessibility', () => {
    render(<SpeakerBioCards />);
    const section = screen.getByRole('region', { name: /speakers/i });
    expect(section).toBeInTheDocument();
  });
});
