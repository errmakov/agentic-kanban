import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const TTL_MS = 60_000;

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'attendee-counter.json');

type Store = { sessions: Record<string, number> };

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Store>;
    return { sessions: parsed.sessions ?? {} };
  } catch {
    return { sessions: {} };
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(store), 'utf8');
}

function prune(store: Store, now: number): Store {
  const sessions: Record<string, number> = {};
  for (const [id, ts] of Object.entries(store.sessions)) {
    if (now - ts < TTL_MS) sessions[id] = ts;
  }
  return { sessions };
}

export async function GET() {
  const store = prune(await readStore(), Date.now());
  return NextResponse.json({ count: Object.keys(store.sessions).length });
}

export async function POST(request: Request) {
  const { sessionId } = (await request.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }
  const now = Date.now();
  const store = prune(await readStore(), now);
  store.sessions[sessionId] = now;
  await writeStore(store);
  return NextResponse.json({ count: Object.keys(store.sessions).length });
}
