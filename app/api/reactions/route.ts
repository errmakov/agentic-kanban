import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { EMOJIS } from '@/lib/emojis';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'reactions.json');

type Counts = Record<string, number>;

async function readCounts(): Promise<Counts> {
  const counts: Counts = {};
  for (const emoji of EMOJIS) counts[emoji] = 0;
  try {
    const raw = await readFile(dataFile, 'utf8');
    const stored = JSON.parse(raw) as Counts;
    for (const emoji of EMOJIS) {
      if (typeof stored[emoji] === 'number') counts[emoji] = stored[emoji];
    }
  } catch {
    // No file yet (ENOENT) — start from all zeros.
  }
  return counts;
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
  const { emoji } = (await request.json()) as { emoji?: string };
  if (!emoji || !(EMOJIS as readonly string[]).includes(emoji)) {
    return NextResponse.json({ error: 'unknown emoji' }, { status: 400 });
  }
  const counts = await readCounts();
  counts[emoji] += 1;
  await writeCounts(counts);
  return NextResponse.json({ counts });
}
