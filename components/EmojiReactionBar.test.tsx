import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmojiReactionBar } from './EmojiReactionBar';

describe('EmojiReactionBar', () => {
  it('renders all emoji reaction buttons starting at zero', () => {
    render(<EmojiReactionBar />);
    for (const emoji of ['👍', '❤️', '😂', '🎉', '🤯']) {
      const button = screen.getByRole('button', { name: `React with ${emoji}` });
      expect(button).toHaveTextContent('0');
    }
  });

  it('increments only the clicked emoji count', () => {
    render(<EmojiReactionBar />);
    const thumbs = screen.getByRole('button', { name: 'React with 👍' });
    fireEvent.click(thumbs);
    fireEvent.click(thumbs);
    expect(thumbs).toHaveTextContent('2');

    const heart = screen.getByRole('button', { name: 'React with ❤️' });
    expect(heart).toHaveTextContent('0');
  });

  it('renders the Reactions section heading', () => {
    render(<EmojiReactionBar />);
    expect(screen.getByRole('heading', { name: 'Reactions' })).toBeInTheDocument();
  });

  it('each emoji button has an accessible aria-label', () => {
    render(<EmojiReactionBar />);
    for (const emoji of ['👍', '❤️', '😂', '🎉', '🤯']) {
      expect(
        screen.getByRole('button', { name: `React with ${emoji}` }),
      ).toBeInTheDocument();
    }
  });

  it('renders at least 4 emoji buttons', () => {
    render(<EmojiReactionBar />);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
  });

  it('increments each emoji independently', () => {
    render(<EmojiReactionBar />);
    const emojis = ['👍', '❤️', '😂', '🎉', '🤯'];

    emojis.forEach((emoji, idx) => {
      const button = screen.getByRole('button', { name: `React with ${emoji}` });
      for (let i = 0; i <= idx; i++) fireEvent.click(button);
    });

    emojis.forEach((emoji, idx) => {
      const button = screen.getByRole('button', { name: `React with ${emoji}` });
      expect(button).toHaveTextContent(String(idx + 1));
    });
  });

  it('handles rapid repeated clicks correctly', () => {
    render(<EmojiReactionBar />);
    const party = screen.getByRole('button', { name: 'React with 🎉' });
    for (let i = 0; i < 10; i++) fireEvent.click(party);
    expect(party).toHaveTextContent('10');

    // all other buttons must remain at 0
    for (const emoji of ['👍', '❤️', '😂', '🤯']) {
      expect(screen.getByRole('button', { name: `React with ${emoji}` })).toHaveTextContent('0');
    }
  });
});
