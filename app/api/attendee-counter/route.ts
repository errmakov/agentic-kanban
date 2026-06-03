import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 30_000;
const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'attendee-counter.json');

type Store = { sessions: Record<string, number> };

// Serialize file access so concurrent heartbeats don't clobber each other's writes.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw) as Store;
    return { sessions: parsed.sessions ?? {} };
  } catch {
    return { sessions: {} };
  }
}

function prune(store: Store, now: number): Store {
  const sessions: Record<string, number> = {};
  for (const [id, ts] of Object.entries(store.sessions)) {
    if (now - ts < TIMEOUT_MS) sessions[id] = ts;
  }
  return { sessions };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { sessionId?: unknown } | null;
  const sessionId = body?.sessionId;
  if (typeof sessionId !== 'string' || sessionId.length === 0) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  const count = await withLock(async () => {
    const now = Date.now();
    const store = prune(await readStore(), now);
    store.sessions[sessionId] = now;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(store));
    return Object.keys(store.sessions).length;
  });

  return NextResponse.json({ count });
}

export async function GET() {
  const store = prune(await readStore(), Date.now());
  return NextResponse.json({ count: Object.keys(store.sessions).length });
}
