import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpeakerCard } from './SpeakerCard';

describe('SpeakerCard', () => {
  const onVote = vi.fn();
  const defaultProps = {
    name: 'Alex Rivera',
    role: 'Senior Software Engineer',
    bio: 'Alex has 10+ years building distributed systems.',
    up: 5,
    down: 2,
    onVote,
  };

  beforeEach(() => {
    onVote.mockClear();
  });

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

  it('calls onVote with "up" when thumbs-up is clicked', () => {
    render(<SpeakerCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /thumbs up for alex rivera/i }));
    expect(onVote).toHaveBeenCalledOnce();
    expect(onVote).toHaveBeenCalledWith('up');
  });

  it('calls onVote with "down" when thumbs-down is clicked', () => {
    render(<SpeakerCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /thumbs down for alex rivera/i }));
    expect(onVote).toHaveBeenCalledOnce();
    expect(onVote).toHaveBeenCalledWith('down');
  });

  it('renders zero counts correctly', () => {
    render(<SpeakerCard {...defaultProps} up={0} down={0} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('0');
    expect(buttons[1]).toHaveTextContent('0');
  });

  it('renders as an article element', () => {
    const { container } = render(<SpeakerCard {...defaultProps} />);
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
