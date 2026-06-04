import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpeakerCard } from './SpeakerCard';

describe('SpeakerCard', () => {
  const defaultProps = {
    name: 'Alex Rivera',
    role: 'Senior Software Engineer',
    bio: 'Alex has 10+ years building distributed systems.',
    up: 5,
    down: 2,
    onVote: vi.fn(),
  };

  it('renders the speaker name', () => {
    render(<SpeakerCard {...defaultProps} />);
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
  });

  it('renders the speaker role', () => {
    render(<SpeakerCard {...defaultProps} />);
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
  });

  it('renders the speaker bio', () => {
    render(<SpeakerCard {...defaultProps} />);
    expect(screen.getByText('Alex has 10+ years building distributed systems.')).toBeInTheDocument();
  });

  it('renders thumbs-up button with count', () => {
    render(<SpeakerCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /thumbs up for alex rivera/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thumbs up/i })).toHaveTextContent('5');
  });

  it('renders thumbs-down button with count', () => {
    render(<SpeakerCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /thumbs down for alex rivera/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thumbs down/i })).toHaveTextContent('2');
  });
});
