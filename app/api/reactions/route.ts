import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export const EMOJIS = ['👍', '❤️', '🔥', '👏', '😂'] as const;

type Counts = Record<string, number>;

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'reactions.json');

function emptyCounts(): Counts {
  return Object.fromEntries(EMOJIS.map((emoji) => [emoji, 0]));
}

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const stored = JSON.parse(raw) as Counts;
    return { ...emptyCounts(), ...stored };
  } catch {
    return emptyCounts();
  }
}

async function writeCounts(counts: Counts): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(counts), 'utf8');
}

export async function GET() {
  return NextResponse.json(await readCounts());
}

export async function POST(request: Request) {
  let emoji: unknown;
  try {
    ({ emoji } = await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  if (typeof emoji !== 'string' || !EMOJIS.includes(emoji as (typeof EMOJIS)[number])) {
    return NextResponse.json({ error: 'unknown emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await writeCounts(counts);

  return NextResponse.json(counts);
}
