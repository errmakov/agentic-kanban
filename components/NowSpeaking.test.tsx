import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NowSpeaking } from './NowSpeaking';

function mockFetch(session: string) {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({ session }),
  }) as unknown as typeof fetch;
}

describe('NowSpeaking', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the session name when set', async () => {
    mockFetch('Test Session');
    render(<NowSpeaking />);
    expect(await screen.findByText('Test Session')).toBeInTheDocument();
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });

  it('renders nothing when the session is empty', async () => {
    mockFetch('');
    const { container } = render(<NowSpeaking />);
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
