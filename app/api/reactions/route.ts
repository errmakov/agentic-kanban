import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { EMOJIS, zeroCounts, type ReactionCounts } from '@/lib/emojis';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'reactions.json');

async function readCounts(): Promise<ReactionCounts> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    return { ...zeroCounts(), ...(JSON.parse(raw) as ReactionCounts) };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return zeroCounts();
    }
    throw err;
  }
}

export async function GET() {
  return NextResponse.json(await readCounts());
}

export async function POST(request: NextRequest) {
  const { emoji } = (await request.json()) as { emoji?: string };

  if (!emoji || !EMOJIS.includes(emoji as (typeof EMOJIS)[number])) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;

  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(counts), 'utf8');

  return NextResponse.json(counts);
}
