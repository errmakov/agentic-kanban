import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpeakerBioCards } from './index';

describe('SpeakerBioCards', () => {
  it('renders a speaker name', () => {
    render(<SpeakerBioCards />);
    expect(screen.getByText('Ada Okafor')).toBeInTheDocument();
  });

  it('renders the Speakers heading', () => {
    render(<SpeakerBioCards />);
    expect(
      screen.getByRole('heading', { name: /speakers/i }),
    ).toBeInTheDocument();
  });
});
