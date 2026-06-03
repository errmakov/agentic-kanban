import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export const EMOJIS = ['👍', '❤️', '🔥', '👏', '😂'] as const;
type Emoji = (typeof EMOJIS)[number];
type Counts = Record<Emoji, number>;

const DATA_DIR = process.env.DATA_DIR ?? './data';
const DATA_FILE = path.join(DATA_DIR, 'emoji-reaction-bar.json');

function zeroCounts(): Counts {
  return Object.fromEntries(EMOJIS.map((e) => [e, 0])) as Counts;
}

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Counts>;
    const counts = zeroCounts();
    for (const emoji of EMOJIS) {
      if (typeof parsed[emoji] === 'number') counts[emoji] = parsed[emoji] as number;
    }
    return counts;
  } catch {
    return zeroCounts();
  }
}

// Serialize writes within this process so concurrent increments don't clobber each other.
let writeChain: Promise<unknown> = Promise.resolve();

function increment(emoji: Emoji): Promise<Counts> {
  const next = writeChain.then(async () => {
    const counts = await readCounts();
    counts[emoji] += 1;
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(counts), 'utf8');
    return counts;
  });
  // Keep the chain alive even if a write fails.
  writeChain = next.catch(() => undefined);
  return next;
}

export async function GET() {
  const counts = await readCounts();
  return NextResponse.json(counts);
}

export async function POST(request: Request) {
  let emoji: unknown;
  try {
    ({ emoji } = await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  if (typeof emoji !== 'string' || !EMOJIS.includes(emoji as Emoji)) {
    return NextResponse.json({ error: 'unknown emoji' }, { status: 400 });
  }

  try {
    const counts = await increment(emoji as Emoji);
    return NextResponse.json(counts);
  } catch {
    return NextResponse.json({ error: 'could not persist reaction' }, { status: 500 });
  }
}
