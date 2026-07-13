import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export const EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '🤯'] as const;

const dir = process.env.DATA_DIR ?? './data';
const file = path.join(dir, 'emoji-reactions.json');

type Counts = Record<string, number>;

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw) as Counts;
  } catch {
    return {};
  }
}

function withDefaults(counts: Counts): Counts {
  return Object.fromEntries(EMOJIS.map((e) => [e, counts[e] ?? 0]));
}

export async function GET() {
  const counts = await readCounts();
  return NextResponse.json(withDefaults(counts));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { emoji?: string } | null;
  const emoji = body?.emoji;

  if (typeof emoji !== 'string' || !EMOJIS.includes(emoji as (typeof EMOJIS)[number])) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }

  await mkdir(dir, { recursive: true });
  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await writeFile(file, JSON.stringify(counts));

  return NextResponse.json(withDefaults(counts));
}
