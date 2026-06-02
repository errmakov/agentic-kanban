import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

type CountdownState = { endTime: number | null };

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'countdown.json');

async function readState(): Promise<CountdownState> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as CountdownState;
  } catch {
    return { endTime: null };
  }
}

async function writeState(state: CountdownState): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state), 'utf8');
}

export async function GET() {
  return NextResponse.json(await readState());
}

export async function POST(request: Request) {
  const { minutes, seconds } = await request.json();

  if (
    typeof minutes !== 'number' ||
    typeof seconds !== 'number' ||
    !Number.isInteger(minutes) ||
    !Number.isInteger(seconds) ||
    minutes < 0 ||
    minutes > 99 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
  }

  const durationSeconds = minutes * 60 + seconds;
  if (durationSeconds < 1) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
  }

  const state: CountdownState = { endTime: Date.now() + durationSeconds * 1000 };
  await writeState(state);
  return NextResponse.json(state);
}

export async function DELETE() {
  const state: CountdownState = { endTime: null };
  await writeState(state);
  return NextResponse.json(state);
}
