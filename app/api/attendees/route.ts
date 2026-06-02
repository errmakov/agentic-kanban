import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ACTIVE_WINDOW_MS = 30_000;
const STALE_WINDOW_MS = 60_000;

// sessionId -> lastSeenMs. Lives in the Node process; the viewer count is
// ephemeral and does not need to survive a redeploy.
const sessions = new Map<string, number>();

export function GET() {
  const now = Date.now();
  let count = 0;
  for (const lastSeen of sessions.values()) {
    if (now - lastSeen <= ACTIVE_WINDOW_MS) count += 1;
  }
  return NextResponse.json({ count });
}

export async function POST(request: NextRequest) {
  const { sessionId } = (await request.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const now = Date.now();
  sessions.set(sessionId, now);

  for (const [id, lastSeen] of sessions) {
    if (now - lastSeen > STALE_WINDOW_MS) sessions.delete(id);
  }

  return NextResponse.json({ ok: true });
}
