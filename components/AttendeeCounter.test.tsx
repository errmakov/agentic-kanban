import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendeeCounter } from './AttendeeCounter';

type MockSource = {
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((event: Event) => void) | null;
  close: ReturnType<typeof vi.fn>;
};

let lastSource: MockSource;

beforeEach(() => {
  global.EventSource = vi.fn(() => {
    lastSource = { onmessage: null, onerror: null, close: vi.fn() };
    return lastSource;
  }) as unknown as typeof EventSource;
});

describe('AttendeeCounter', () => {
  it('renders the default count of 1 before any SSE message', () => {
    render(<AttendeeCounter />);
    expect(screen.getByLabelText('Attendees viewing')).toHaveTextContent('1 viewing');
  });

  it('updates the count when an SSE message arrives', () => {
    render(<AttendeeCounter />);
    act(() => {
      lastSource.onmessage?.({ data: '5' });
    });
    expect(screen.getByLabelText('Attendees viewing')).toHaveTextContent('5 viewing');
  });

  it('does not reset count to 0 on SSE error — retains last known value', () => {
    render(<AttendeeCounter />);
    act(() => {
      lastSource.onmessage?.({ data: '3' });
    });
    act(() => {
      lastSource.onerror?.(new Event('error'));
    });
    expect(screen.getByLabelText('Attendees viewing')).toHaveTextContent('3 viewing');
  });

  it('closes the EventSource when the component unmounts', () => {
    const { unmount } = render(<AttendeeCounter />);
    unmount();
    expect(lastSource.close).toHaveBeenCalledOnce();
  });

  it('opens the EventSource pointed at /api/viewers', () => {
    render(<AttendeeCounter />);
    expect(global.EventSource).toHaveBeenCalledWith('/api/viewers');
  });
});
