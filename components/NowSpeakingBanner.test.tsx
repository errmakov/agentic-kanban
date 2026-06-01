import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NowSpeakingBanner } from './NowSpeakingBanner';

describe('NowSpeakingBanner', () => {
  it('renders the "Now Speaking" label', () => {
    render(<NowSpeakingBanner />);
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });

  it('renders the default session name when the env var is unset', () => {
    render(<NowSpeakingBanner />);
    expect(screen.getByText('Agentic Kanban Workshop')).toBeInTheDocument();
  });
});
