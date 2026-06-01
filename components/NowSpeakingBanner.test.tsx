import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NowSpeakingBanner } from './NowSpeakingBanner';

describe('NowSpeakingBanner', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the "Now Speaking" label', () => {
    render(<NowSpeakingBanner />);
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });

  it('renders the default session name when the env var is unset', () => {
    render(<NowSpeakingBanner />);
    expect(screen.getByText('Agentic Kanban Workshop')).toBeInTheDocument();
  });

  it('renders a custom session name from NEXT_PUBLIC_SESSION_NAME', () => {
    vi.stubEnv('NEXT_PUBLIC_SESSION_NAME', 'Platform Engineering Summit');
    render(<NowSpeakingBanner />);
    expect(screen.getByText('Platform Engineering Summit')).toBeInTheDocument();
  });

  it('has an accessible aria-label on the banner element', () => {
    render(<NowSpeakingBanner />);
    expect(screen.getByRole('generic', { name: /now speaking/i })).toBeInTheDocument();
  });
});
