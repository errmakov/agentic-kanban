import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const TTL_MS = 90_000;

const dir = process.env.DATA_DIR ?? './data';
const file = path.join(dir, 'attendee-counter.json');

type Store = { sessions: Record<string, number> };

async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw) as Store;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { sessions: {} };
    }
    throw err;
  }
}

function activeCount(sessions: Record<string, number>, now: number): number {
  return Object.values(sessions).filter((ts) => now - ts < TTL_MS).length;
}

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ count: activeCount(store.sessions, Date.now()) });
}

export async function POST(request: NextRequest) {
  const { sessionId } = (await request.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  const now = Date.now();
  const store = await readStore();
  store.sessions[sessionId] = now;

  // Prune stale sessions so the file stays small between events.
  for (const [id, ts] of Object.entries(store.sessions)) {
    if (now - ts >= TTL_MS) delete store.sessions[id];
  }

  await mkdir(dir, { recursive: true });
  await writeFile(file, JSON.stringify(store), 'utf8');

  return NextResponse.json({ count: activeCount(store.sessions, now) });
}
