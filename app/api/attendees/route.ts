import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Process-scoped presence map (sessionId -> lastSeen ms). Viewer presence is
// ephemeral, so in-memory state is fine: a restart briefly resets the count and
// clients re-register within one heartbeat cycle. In a multi-process deployment
// each process keeps its own map; for the single-instance VPS demo that's fine.
const sessions = new Map<string, number>();

const EXPIRY_MS = 30_000;

function prune() {
  const cutoff = Date.now() - EXPIRY_MS;
  for (const [id, lastSeen] of sessions) {
    if (lastSeen < cutoff) sessions.delete(id);
  }
}

export async function POST(request: Request) {
  const { sessionId } = await request.json();
  if (typeof sessionId === 'string' && sessionId) {
    sessions.set(sessionId, Date.now());
  }
  prune();
  return NextResponse.json({ count: sessions.size });
}

export function GET() {
  prune();
  return NextResponse.json({ count: sessions.size });
}
