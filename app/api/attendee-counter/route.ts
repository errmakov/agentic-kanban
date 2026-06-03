import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = join(DATA_DIR, 'attendee-counter.json');

/** A session counts as "watching" if it sent a heartbeat within this window. */
const ACTIVE_WINDOW_MS = 30_000;
/** Sessions older than this are pruned from the file on every write. */
const STALE_WINDOW_MS = 60_000;

type Sessions = Record<string, number>;

async function readSessions(): Promise<Sessions> {
  try {
    const raw = await readFile(FILE, 'utf8');
    return JSON.parse(raw) as Sessions;
  } catch {
    return {};
  }
}

async function writeSessions(sessions: Sessions): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(sessions), 'utf8');
}

function countActive(sessions: Sessions, now: number): number {
  return Object.values(sessions).filter((seen) => now - seen <= ACTIVE_WINDOW_MS).length;
}

export async function GET() {
  const sessions = await readSessions();
  const count = countActive(sessions, Date.now());
  return NextResponse.json({ count });
}

export async function POST(request: Request) {
  const { sessionId } = (await request.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const now = Date.now();
  const sessions = await readSessions();
  sessions[sessionId] = now;

  // Prune stale entries so the file can't grow unbounded.
  for (const [id, seen] of Object.entries(sessions)) {
    if (now - seen > STALE_WINDOW_MS) delete sessions[id];
  }

  await writeSessions(sessions);
  return NextResponse.json({ count: countActive(sessions, now) });
}
