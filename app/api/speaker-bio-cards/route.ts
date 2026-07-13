import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SPEAKERS } from '@/features/speaker-bio-cards/speakers';

export const dynamic = 'force-dynamic';

const dir = process.env.DATA_DIR ?? './data';
const file = path.join(dir, 'speaker-bio-cards.json');

type Tally = { up: number; down: number };
type Tallies = Record<string, Tally>;

const SPEAKER_IDS = new Set(SPEAKERS.map((s) => s.id));

async function readTallies(): Promise<Tallies> {
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw) as Tallies;
  } catch {
    return {};
  }
}

function withDefaults(tallies: Tallies): Tallies {
  return Object.fromEntries(
    SPEAKERS.map((s) => [
      s.id,
      { up: tallies[s.id]?.up ?? 0, down: tallies[s.id]?.down ?? 0 },
    ]),
  );
}

export async function GET() {
  const tallies = await readTallies();
  return NextResponse.json({ tallies: withDefaults(tallies) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    speakerId?: string;
    vote?: string;
  } | null;
  const speakerId = body?.speakerId;
  const vote = body?.vote;

  if (typeof speakerId !== 'string' || !SPEAKER_IDS.has(speakerId)) {
    return NextResponse.json({ error: 'invalid speakerId' }, { status: 400 });
  }
  if (vote !== 'up' && vote !== 'down') {
    return NextResponse.json({ error: 'invalid vote' }, { status: 400 });
  }

  await mkdir(dir, { recursive: true });
  const tallies = await readTallies();
  const current = { up: tallies[speakerId]?.up ?? 0, down: tallies[speakerId]?.down ?? 0 };
  current[vote] += 1;
  tallies[speakerId] = current;
  await writeFile(file, JSON.stringify(tallies));

  return NextResponse.json({ speakerId, tally: current });
}
