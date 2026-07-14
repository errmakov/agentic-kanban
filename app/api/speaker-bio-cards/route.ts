import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Tally = { up: number; down: number };
type Ratings = Record<string, Tally>;

const SPEAKER_IDS = ['ada-lovelace', 'grace-hopper', 'alan-turing'] as const;

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'speaker-ratings.json');

async function readRatings(): Promise<Ratings> {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw) as Ratings;
  } catch {
    return {};
  }
}

function withDefaults(ratings: Ratings): Ratings {
  const full: Ratings = {};
  for (const id of SPEAKER_IDS) {
    full[id] = ratings[id] ?? { up: 0, down: 0 };
  }
  return full;
}

export async function GET() {
  const ratings = await readRatings();
  return NextResponse.json(withDefaults(ratings));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { speakerId, vote } = (body ?? {}) as {
    speakerId?: unknown;
    vote?: unknown;
  };

  if (
    typeof speakerId !== 'string' ||
    !(SPEAKER_IDS as readonly string[]).includes(speakerId)
  ) {
    return NextResponse.json({ error: 'Invalid speakerId' }, { status: 400 });
  }
  if (vote !== 'up' && vote !== 'down') {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 });
  }

  await fs.mkdir(dataDir, { recursive: true });
  const ratings = await readRatings();
  const tally = ratings[speakerId] ?? { up: 0, down: 0 };
  tally[vote] += 1;
  ratings[speakerId] = tally;
  await fs.writeFile(dataFile, JSON.stringify(ratings), 'utf8');

  return NextResponse.json(tally);
}
