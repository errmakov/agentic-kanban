import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

/** A viewer is "active" if their last heartbeat was within this window. */
const ACTIVE_TTL_MS = 30_000;

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = join(dataDir, 'attendee-counter.json');

type Presence = Record<string, number>;

async function readPresence(): Promise<Presence> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    return JSON.parse(raw) as Presence;
  } catch {
    // Missing/corrupt file → start fresh.
    return {};
  }
}

async function writePresence(presence: Presence): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(presence));
}

function activeCount(presence: Presence, now: number): number {
  return Object.values(presence).filter((seen) => now - seen < ACTIVE_TTL_MS).length;
}

export async function GET() {
  const presence = await readPresence();
  return NextResponse.json({ count: activeCount(presence, Date.now()) });
}

export async function POST(request: Request) {
  const { id } = (await request.json()) as { id?: string };
  if (typeof id !== 'string' || id.length === 0) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  const now = Date.now();
  const presence = await readPresence();
  presence[id] = now;
  await writePresence(presence);

  return NextResponse.json({ count: activeCount(presence, now) });
}
