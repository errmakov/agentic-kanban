import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

/** The fixed, whitelisted emoji set — the single source of truth for validation. */
export const EMOJIS = ['👍', '❤️', '🔥', '🎉'] as const;

type Counts = Record<string, number>;

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'emoji-reactions.json');

const zeroed = (): Counts => Object.fromEntries(EMOJIS.map((e) => [e, 0]));

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw) as Counts;
    // Merge onto a zeroed base so any newly-added emoji still reports a count.
    return { ...zeroed(), ...parsed };
  } catch {
    return zeroed();
  }
}

async function writeCounts(counts: Counts): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(counts), 'utf8');
}

export async function GET() {
  const counts = await readCounts();
  return NextResponse.json({ counts });
}

export async function POST(request: Request) {
  const { emoji } = (await request.json().catch(() => ({}))) as { emoji?: string };

  if (typeof emoji !== 'string' || !EMOJIS.includes(emoji as (typeof EMOJIS)[number])) {
    return NextResponse.json({ error: 'Unknown emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await writeCounts(counts);

  return NextResponse.json({ counts });
}
