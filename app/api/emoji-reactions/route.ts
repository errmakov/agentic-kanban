import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const EMOJIS = ['👍', '❤️', '🎉', '🚀'] as const;
type Emoji = (typeof EMOJIS)[number];
type Counts = Record<Emoji, number>;

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'emoji-reactions.json');

function emptyCounts(): Counts {
  return EMOJIS.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Counts);
}

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Counts>;
    return { ...emptyCounts(), ...parsed };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return emptyCounts();
    throw err;
  }
}

async function writeCounts(counts: Counts): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(counts), 'utf8');
}

export async function GET() {
  return NextResponse.json(await readCounts());
}

export async function POST(request: Request) {
  const { emoji } = (await request.json()) as { emoji?: string };
  if (!emoji || !EMOJIS.includes(emoji as Emoji)) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }
  const counts = await readCounts();
  counts[emoji as Emoji] += 1;
  await writeCounts(counts);
  return NextResponse.json(counts);
}
