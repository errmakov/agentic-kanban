import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'feedback-widget.json');

type Counts = { up: number; down: number };

const VOTES = ['up', 'down'] as const;
type Vote = (typeof VOTES)[number];

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readCounts(): Promise<Counts> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Counts;
    return { up: parsed.up ?? 0, down: parsed.down ?? 0 };
  } catch {
    return { up: 0, down: 0 };
  }
}

export async function GET() {
  return NextResponse.json(await readCounts());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { vote?: string };
  const vote = body.vote;

  if (!vote || !VOTES.includes(vote as Vote)) {
    return NextResponse.json({ error: 'invalid vote' }, { status: 400 });
  }

  const counts = await withLock(async () => {
    const current = await readCounts();
    current[vote as Vote] += 1;
    await mkdir(dataDir, { recursive: true });
    await writeFile(filePath, JSON.stringify(current), 'utf8');
    return current;
  });

  return NextResponse.json(counts);
}
