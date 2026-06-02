import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SpeakerBioCards } from './SpeakerBioCards';

describe('SpeakerBioCards', () => {
  it('renders at least one speaker name', () => {
    render(<SpeakerBioCards />);
    expect(
      screen.getByRole('heading', { name: /ada okafor/i }),
    ).toBeInTheDocument();
  });
});
