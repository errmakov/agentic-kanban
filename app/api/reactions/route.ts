import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { EMOJIS, type ReactionCounts } from '@/lib/reactions';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'reactions.json');

function zeroed(): ReactionCounts {
  return Object.fromEntries(EMOJIS.map((emoji) => [emoji, 0]));
}

async function readCounts(): Promise<ReactionCounts> {
  try {
    const raw = await readFile(dataFile, 'utf-8');
    return JSON.parse(raw) as ReactionCounts;
  } catch {
    const counts = zeroed();
    await mkdir(dataDir, { recursive: true });
    await writeFile(dataFile, JSON.stringify(counts), 'utf-8');
    return counts;
  }
}

export async function GET() {
  return NextResponse.json(await readCounts());
}

export async function POST(request: Request) {
  const { emoji } = (await request.json()) as { emoji?: string };
  if (!emoji || !(EMOJIS as readonly string[]).includes(emoji)) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }
  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(counts), 'utf-8');
  return NextResponse.json(counts);
}
