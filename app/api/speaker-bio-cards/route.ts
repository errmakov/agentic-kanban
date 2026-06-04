import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

type Tally = { up: number; down: number };
type Tallies = Record<string, Tally>;

const VALID_VOTES = new Set(['up', 'down']);

function dataPath() {
  const dir = process.env.DATA_DIR ?? './data';
  return path.join(dir, 'speaker-bio-cards.json');
}

async function readTallies(): Promise<Tallies> {
  try {
    const raw = await fs.readFile(dataPath(), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeTallies(tallies: Tallies) {
  const p = dataPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(tallies));
}

export async function GET() {
  const tallies = await readTallies();
  return NextResponse.json(tallies);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { speakerId, vote } = body as { speakerId: unknown; vote: unknown };

  if (typeof speakerId !== 'string' || speakerId.trim() === '') {
    return NextResponse.json({ error: 'Invalid speakerId' }, { status: 400 });
  }
  if (typeof vote !== 'string' || !VALID_VOTES.has(vote)) {
    return NextResponse.json({ error: 'vote must be "up" or "down"' }, { status: 400 });
  }

  const tallies = await readTallies();
  const current = tallies[speakerId] ?? { up: 0, down: 0 };
  const updated: Tally = { ...current, [vote]: current[vote as 'up' | 'down'] + 1 };
  tallies[speakerId] = updated;
  await writeTallies(tallies);

  return NextResponse.json({ speakerId, tally: updated });
}
