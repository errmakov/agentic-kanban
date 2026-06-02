import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

  it('shows a prompt to set the session when empty', async () => {
    mockFetch('');
    render(<NowSpeaking />);
    expect(await screen.findByRole('button', { name: /set who/i })).toBeInTheDocument();
  });

  it('shows the prompt when fetch rejects', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch;
    render(<NowSpeaking />);
    expect(await screen.findByRole('button', { name: /set who/i })).toBeInTheDocument();
  });

  it('shows the prompt when API returns non-string session', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ session: 42 }),
    }) as unknown as typeof fetch;
    render(<NowSpeaking />);
    expect(await screen.findByRole('button', { name: /set who/i })).toBeInTheDocument();
  });

  it('renders session name with special characters safely', async () => {
    mockFetch('Alice <script>alert(1)</script>');
    render(<NowSpeaking />);
    expect(await screen.findByText('Alice <script>alert(1)</script>')).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });

  it('lets an organizer set the session and persists it via PUT', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ session: '' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<NowSpeaking />);

    fireEvent.click(await screen.findByRole('button', { name: /set who/i }));
    fireEvent.change(screen.getByLabelText(/now speaking/i), {
      target: { value: 'Alice — Intro' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Alice — Intro')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/now-speaking',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ session: 'Alice — Intro' }),
        }),
      );
    });
  });
});
