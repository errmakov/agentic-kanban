import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { EMOJIS, emptyCounts, type Counts } from '@/features/emoji-reactions/emojis';

export const dynamic = 'force-dynamic';

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'emoji-reactions.json');

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw) as Counts;
    // Merge over a fresh zeroed base so every emoji is always present.
    return { ...emptyCounts(), ...parsed };
  } catch {
    return emptyCounts();
  }
}

async function writeCounts(counts: Counts): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(counts), 'utf8');
}

export async function GET() {
  const counts = await readCounts();
  return NextResponse.json({ counts });
}

export async function POST(request: Request) {
  let emoji: unknown;
  try {
    ({ emoji } = (await request.json()) as { emoji?: unknown });
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  if (typeof emoji !== 'string' || !(EMOJIS as readonly string[]).includes(emoji)) {
    return NextResponse.json({ error: 'unknown emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await writeCounts(counts);

  return NextResponse.json({ counts });
}
