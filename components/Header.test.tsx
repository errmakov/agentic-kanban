import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from './Header';

beforeEach(() => {
  global.EventSource = vi.fn(() => ({
    onmessage: null,
    onerror: null,
    close: vi.fn(),
  })) as unknown as typeof EventSource;
});

describe('Header', () => {
  it('renders the FactoryWall title', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { name: 'FactoryWall' })).toBeInTheDocument();
  });

  it('renders the attendee counter alongside the title', () => {
    render(<Header />);
    expect(screen.getByLabelText('Attendees viewing')).toBeInTheDocument();
  });

  it('renders the counter and title in the same header element', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toContainElement(screen.getByRole('heading', { name: 'FactoryWall' }));
    expect(header).toContainElement(screen.getByLabelText('Attendees viewing'));
  });
});
