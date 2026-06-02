import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

class MockEventSource {
  onmessage: ((e: { data: string }) => void) | null = null;
  close = vi.fn();
  constructor(public url: string) {
    instances.push(this);
  }
}

let instances: MockEventSource[] = [];

describe('AttendeeCounter', () => {
  beforeEach(() => {
    instances = [];
    vi.stubGlobal('EventSource', MockEventSource);
  });

  it('renders nothing before the first message', () => {
    const { container } = render(<AttendeeCounter />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the count received from the EventSource', () => {
    render(<AttendeeCounter />);
    act(() => {
      instances[0].onmessage?.({ data: '5' });
    });
    expect(screen.getByText(/5 online/)).toBeInTheDocument();
  });
});
