import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpeakerBioCards } from './index';
import feature from './index';

describe('SpeakerBioCards', () => {
  it('renders the Speakers heading', () => {
    render(<SpeakerBioCards />);
    expect(
      screen.getByRole('heading', { name: /speakers/i }),
    ).toBeInTheDocument();
  });

  it('renders at least 2 speaker cards', () => {
    render(<SpeakerBioCards />);
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBeGreaterThanOrEqual(2);
  });

  it('renders all three speaker names', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Ada Okafor')).toBeInTheDocument();
    expect(screen.getByText('Mateo Rossi')).toBeInTheDocument();
    expect(screen.getByText('Lena Hart')).toBeInTheDocument();
  });

  it('renders the role for each speaker', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Principal Engineer, FactoryWall')).toBeInTheDocument();
    expect(screen.getByText('Developer Advocate')).toBeInTheDocument();
    expect(screen.getByText('Staff AI Researcher')).toBeInTheDocument();
  });

  it('renders a bio for each speaker', () => {
    render(<SpeakerBioCards />);
    expect(
      screen.getByText(/Builds live agent pipelines/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/agentic workflows/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/autonomous agents reliable/i),
    ).toBeInTheDocument();
  });

  it('renders a section with accessible heading', () => {
    render(<SpeakerBioCards />);
    const section = screen.getByRole('region', { name: /speakers/i });
    expect(section).toBeInTheDocument();
  });
});

describe('speaker-bios feature descriptor', () => {
  it('has the correct id', () => {
    expect(feature.id).toBe('speaker-bios');
  });

  it('is registered in the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 10 to render before later features', () => {
    expect(feature.order).toBe(10);
  });

  it('exports SpeakerBioCards as its Component', () => {
    expect(feature.Component).toBe(SpeakerBioCards);
  });
});
