import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import feature from './index';

const FeedbackWidget = feature.Component;

describe('FeedbackWidget', () => {
  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  const initialCounts = { up: 5, down: 2 };
  const afterUp = { up: 6, down: 2 };
  const afterDown = { up: 5, down: 3 };

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation((_url, init) =>
      Promise.resolve(
        init?.method === 'POST' ? json(afterUp) : json(initialCounts),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial counts fetched from the API', async () => {
    render(<FeedbackWidget />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('clicking thumbs up posts vote=up and updates count', async () => {
    render(<FeedbackWidget />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /thumbs up/i }));

    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/feedback-widget',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ vote: 'up' }),
      }),
    );
    await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument());
  });

  it('clicking thumbs down posts vote=down and updates count', async () => {
    vi.mocked(global.fetch).mockImplementation((_url, init) =>
      Promise.resolve(
        init?.method === 'POST' ? json(afterDown) : json(initialCounts),
      ),
    );

    render(<FeedbackWidget />);
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /thumbs down/i }));

    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/feedback-widget',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ vote: 'down' }),
      }),
    );
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument());
  });

  it('reverts optimistic increment when POST fails', async () => {
    vi.mocked(global.fetch).mockImplementation((_url, init) =>
      Promise.resolve(
        init?.method === 'POST'
          ? new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
          : json(initialCounts),
      ),
    );

    render(<FeedbackWidget />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /thumbs up/i }));
    expect(screen.getByText('6')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
  });

  it('silently recovers when GET fetch fails', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    render(<FeedbackWidget />);

    // Buttons render without crashing; counts stay at zero
    expect(screen.getAllByRole('button')).toHaveLength(2);
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });
    // Both counts remain 0 after failed GET
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(2);
  });

  it('disables buttons while a request is in-flight', async () => {
    let resolvePost!: (r: Response) => void;
    vi.mocked(global.fetch).mockImplementation((_url, init) => {
      if (init?.method === 'POST') {
        return new Promise<Response>((res) => {
          resolvePost = res;
        });
      }
      return Promise.resolve(json(initialCounts));
    });

    render(<FeedbackWidget />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /thumbs up/i }));

    expect(screen.getByRole('button', { name: /thumbs up/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /thumbs down/i })).toBeDisabled();

    resolvePost(json(afterUp));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /thumbs up/i })).not.toBeDisabled(),
    );
  });
});

describe('feature descriptor', () => {
  it('has id feedback-widget', () => {
    expect(feature.id).toBe('feedback-widget');
  });

  it('renders into the main slot', () => {
    expect(feature.slot).toBe('main');
  });

  it('has order 200', () => {
    expect(feature.order).toBe(200);
  });
});
