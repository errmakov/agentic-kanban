import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export const dynamic = 'force-dynamic';

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = join(DATA_DIR, 'attendee-counter.json');

/** A session is "active" if its last heartbeat is within this window. */
const ACTIVE_WINDOW_MS = 30_000;
/** Heartbeats older than this are pruned on write to keep the file bounded. */
const PRUNE_WINDOW_MS = 60_000;

type Heartbeats = Record<string, number>;

async function readHeartbeats(): Promise<Heartbeats> {
  try {
    return JSON.parse(await readFile(FILE, 'utf8')) as Heartbeats;
  } catch {
    return {};
  }
}

export async function GET() {
  const heartbeats = await readHeartbeats();
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;
  const count = Object.values(heartbeats).filter((seen) => seen >= cutoff).length;
  return NextResponse.json({ count });
}

export async function POST(request: Request) {
  const { sessionId } = (await request.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const now = Date.now();
  const heartbeats = await readHeartbeats();
  heartbeats[sessionId] = now;

  const cutoff = now - PRUNE_WINDOW_MS;
  for (const [id, seen] of Object.entries(heartbeats)) {
    if (seen < cutoff) delete heartbeats[id];
  }

  await mkdir(dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(heartbeats));

  return NextResponse.json({ ok: true });
}
