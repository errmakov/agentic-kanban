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

  it('renders at least two speaker cards', () => {
    render(<SpeakerBioCards />);
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('renders all three speaker names', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Ada Marković')).toBeInTheDocument();
    expect(screen.getByText('Liam Chen')).toBeInTheDocument();
    expect(screen.getByText('Sofia Ruiz')).toBeInTheDocument();
  });

  it('renders a role for each speaker', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Host & Pipeline Architect')).toBeInTheDocument();
    expect(screen.getByText('Staff Engineer, Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('Product Lead, Live Demos')).toBeInTheDocument();
  });

  it('renders a bio paragraph for each speaker', () => {
    render(<SpeakerBioCards />);
    expect(
      screen.getByText(/agentic delivery systems/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AI coding agents/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/small, self-contained/i),
    ).toBeInTheDocument();
  });

  it('wraps the section with aria-labelledby pointing to the heading', () => {
    const { container } = render(<SpeakerBioCards />);
    const section = container.querySelector('section');
    expect(section).not.toBeNull();
    const labelledBy = section!.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const heading = container.querySelector(`#${labelledBy}`);
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toMatch(/speakers/i);
  });

  it('renders each card as an article element', () => {
    render(<SpeakerBioCards />);
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(3);
  });

  it('renders speaker names as sub-headings inside their cards', () => {
    render(<SpeakerBioCards />);
    const nameHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(nameHeadings.length).toBe(3);
    const names = nameHeadings.map((h) => h.textContent);
    expect(names).toContain('Ada Marković');
    expect(names).toContain('Liam Chen');
    expect(names).toContain('Sofia Ruiz');
  });
});
