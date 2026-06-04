import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SPEAKER_IDS } from '@/features/speaker-bio-cards/speakers';

export const dynamic = 'force-dynamic';

type Tally = { up: number; down: number };
type Tallies = Record<string, Tally>;

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'speaker-ratings.json');

async function readTallies(): Promise<Tallies> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    return JSON.parse(raw) as Tallies;
  } catch {
    return {};
  }
}

async function writeTallies(tallies: Tallies): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(tallies, null, 2), 'utf8');
}

export async function GET() {
  const tallies = await readTallies();
  return NextResponse.json(tallies);
}

export async function POST(request: Request) {
  let body: { speakerId?: unknown; direction?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { speakerId, direction } = body;
  if (typeof speakerId !== 'string' || (direction !== 'up' && direction !== 'down')) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!SPEAKER_IDS.includes(speakerId)) {
    return NextResponse.json({ error: 'Unknown speaker' }, { status: 404 });
  }

  const tallies = await readTallies();
  const current = tallies[speakerId] ?? { up: 0, down: 0 };
  current[direction] += 1;
  tallies[speakerId] = current;
  await writeTallies(tallies);

  return NextResponse.json(current);
}
