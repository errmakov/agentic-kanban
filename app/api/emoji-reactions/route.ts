import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_EMOJIS = ['👏', '🔥', '🤔', '💡'] as const;

type Counts = Record<string, number>;

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'emoji-reactions.json');

function zeroedCounts(): Counts {
  return Object.fromEntries(ALLOWED_EMOJIS.map((e) => [e, 0]));
}

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw) as Counts;
    // Ensure every allowed emoji is present, ignore unknown keys.
    return Object.fromEntries(
      ALLOWED_EMOJIS.map((e) => [e, Number.isFinite(parsed[e]) ? parsed[e] : 0]),
    );
  } catch {
    return zeroedCounts();
  }
}

async function writeCounts(counts: Counts): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(counts), 'utf8');
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

  if (typeof emoji !== 'string' || !ALLOWED_EMOJIS.includes(emoji as (typeof ALLOWED_EMOJIS)[number])) {
    return NextResponse.json({ error: 'invalid emoji' }, { status: 400 });
  }

  // Known race: two interleaved requests can read-then-write stale counts.
  // Acceptable at this scale — no locking by design.
  const counts = await readCounts();
  counts[emoji] += 1;
  await writeCounts(counts);

  return NextResponse.json(counts);
}
