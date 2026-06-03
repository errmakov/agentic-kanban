import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export const EMOJIS = ['👍', '🔥', '❤️', '😂', '🚀'] as const;

const DATA_DIR = process.env.DATA_DIR ?? './data';
const DATA_FILE = path.join(DATA_DIR, 'emoji-reactions.json');

type Counts = Record<string, number>;

function zeroed(): Counts {
  return Object.fromEntries(EMOJIS.map((emoji) => [emoji, 0]));
}

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Counts;
    return { ...zeroed(), ...parsed };
  } catch {
    return zeroed();
  }
}

async function writeCounts(counts: Counts): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(counts), 'utf8');
}

export async function GET() {
  return NextResponse.json(await readCounts());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { emoji?: string } | null;
  const emoji = body?.emoji;

  if (!emoji || !EMOJIS.includes(emoji as (typeof EMOJIS)[number])) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await writeCounts(counts);

  return NextResponse.json(counts);
}
