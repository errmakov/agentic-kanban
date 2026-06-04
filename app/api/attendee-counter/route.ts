import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const sessions = new Map<string, number>();
const STALE_MS = 60_000;

function activeCount(): number {
  const cutoff = Date.now() - STALE_MS;
  return [...sessions.values()].filter((t) => t >= cutoff).length;
}

export async function GET() {
  return NextResponse.json({ count: activeCount() });
}

export async function POST(request: Request) {
  const { sessionId } = (await request.json()) as { sessionId: string };
  sessions.set(sessionId, Date.now());

  // Sweep stale entries
  const cutoff = Date.now() - STALE_MS;
  for (const [id, t] of sessions) {
    if (t < cutoff) sessions.delete(id);
  }

  return NextResponse.json({ count: activeCount() });
}
