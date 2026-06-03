import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥'] as const;
type Counts = Record<string, number>;

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'emoji-reactions.json');

function zeroed(): Counts {
  return Object.fromEntries(EMOJIS.map((e) => [e, 0]));
}

async function readCounts(): Promise<Counts> {
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Counts;
    // Backfill any emoji missing from a stale file.
    return { ...zeroed(), ...parsed };
  } catch {
    return zeroed();
  }
}

export async function GET() {
  return NextResponse.json(await readCounts());
}

export async function POST(request: Request) {
  const { emoji } = (await request.json().catch(() => ({}))) as { emoji?: string };

  if (!emoji || !EMOJIS.includes(emoji as (typeof EMOJIS)[number])) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] += 1;
  await writeFile(filePath, JSON.stringify(counts), 'utf8');

  return NextResponse.json(counts);
}
