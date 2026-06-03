import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NowSpeaking from './index';

const Component = NowSpeaking.Component;

function mockFetch(session: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => ({ session }) })),
  );
}

describe('NowSpeaking', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders no banner when the session is empty', async () => {
    mockFetch('');
    render(<Component />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/now speaking/i)).not.toBeInTheDocument();
  });

  it('renders the session name in the banner when one is set', async () => {
    mockFetch('Intro to Agentic Systems');
    render(<Component />);
    expect(
      await screen.findByText('Intro to Agentic Systems'),
    ).toBeInTheDocument();
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });

  it('always renders the edit form regardless of session state', async () => {
    mockFetch('');
    render(<Component />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(
      screen.getByRole('textbox', { name: /current session name/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('sends a PUT request with the draft value on form submit', async () => {
    const fetchMock = vi.fn(async () => ({ json: async () => ({ session: '' }) }));
    vi.stubGlobal('fetch', fetchMock);

    render(<Component />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const input = screen.getByRole('textbox', { name: /current session name/i });
    fireEvent.change(input, { target: { value: 'New Session Name' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/now-speaking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: 'New Session Name' }),
      });
    });
  });

  it('re-fetches and shows the banner after saving a session name', async () => {
    let getCallCount = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return { json: async () => ({ session: 'Saved Session' }) };
        }
        getCallCount++;
        const session = getCallCount === 1 ? '' : 'Saved Session';
        return { json: async () => ({ session }) };
      }),
    );

    render(<Component />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/now speaking/i)).not.toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: /current session name/i });
    fireEvent.change(input, { target: { value: 'Saved Session' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Saved Session')).toBeInTheDocument();
    expect(screen.getByText(/now speaking/i)).toBeInTheDocument();
  });

  it('has the correct feature descriptor', () => {
    expect(NowSpeaking.id).toBe('now-speaking');
    expect(NowSpeaking.slot).toBe('main');
    expect(NowSpeaking.order).toBe(1);
  });
});
