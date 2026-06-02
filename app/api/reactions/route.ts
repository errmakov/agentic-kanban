import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const EMOJIS = ['👍', '❤️', '🔥', '👏', '🚀'] as const;

const DATA_DIR = process.env.DATA_DIR ?? './data';
const DATA_FILE = path.join(DATA_DIR, 'reactions.json');

type Counts = Record<string, number>;

function zeroCounts(): Counts {
  return Object.fromEntries(EMOJIS.map((emoji) => [emoji, 0]));
}

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Counts;
    const counts = zeroCounts();
    for (const emoji of EMOJIS) {
      if (typeof parsed[emoji] === 'number') counts[emoji] = parsed[emoji];
    }
    return counts;
  } catch {
    return zeroCounts();
  }
}

async function writeCounts(counts: Counts): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(counts), 'utf8');
}

export async function GET() {
  return NextResponse.json({ counts: await readCounts() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { emoji?: string };
  if (!body.emoji || !EMOJIS.includes(body.emoji as (typeof EMOJIS)[number])) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }

  // Read-modify-write is racy under concurrent taps; for an approximate
  // applause meter that is acceptable, so no locking is used.
  const counts = await readCounts();
  counts[body.emoji] += 1;
  await writeCounts(counts);
  return NextResponse.json({ counts });
}
