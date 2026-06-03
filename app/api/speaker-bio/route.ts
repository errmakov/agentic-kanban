import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

type VoteTally = { up: number; down: number };
type VoteData = { votes: Record<string, VoteTally> };

function dataPath() {
  const dir = process.env.DATA_DIR ?? './data';
  return path.join(dir, 'speaker-bio.json');
}

async function readVotes(): Promise<VoteData> {
  try {
    const raw = await fs.readFile(dataPath(), 'utf-8');
    return JSON.parse(raw) as VoteData;
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return { votes: {} };
    throw e;
  }
}

async function writeVotes(data: VoteData): Promise<void> {
  const file = dataPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data));
}

export async function GET() {
  const data = await readVotes();
  return NextResponse.json(data.votes);
}

export async function POST(req: NextRequest) {
  const { speakerId, vote } = (await req.json()) as { speakerId: string; vote: string };

  if (vote !== 'up' && vote !== 'down') {
    return NextResponse.json({ error: 'invalid vote' }, { status: 400 });
  }

  const data = await readVotes();
  if (!data.votes[speakerId]) {
    data.votes[speakerId] = { up: 0, down: 0 };
  }
  data.votes[speakerId][vote] += 1;
  await writeVotes(data);
  return NextResponse.json(data.votes);
}
