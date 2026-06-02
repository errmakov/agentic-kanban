import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export const EMOJIS = ['👍', '❤️', '😂', '🎉', '🤯'] as const;

type Counts = Record<string, number>;

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'reactions.json');

async function readCounts(): Promise<Counts> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw) as Counts;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

async function writeCounts(counts: Counts): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(counts));
}

function withDefaults(counts: Counts): Counts {
  return Object.fromEntries(EMOJIS.map((e) => [e, counts[e] ?? 0]));
}

export async function GET() {
  const counts = await readCounts();
  return NextResponse.json(withDefaults(counts));
}

export async function POST(request: Request) {
  let emoji: unknown;
  try {
    ({ emoji } = await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  if (typeof emoji !== 'string' || !EMOJIS.includes(emoji as (typeof EMOJIS)[number])) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }

  const counts = await readCounts();
  counts[emoji] = (counts[emoji] ?? 0) + 1;
  await writeCounts(counts);
  return NextResponse.json(withDefaults(counts));
}
