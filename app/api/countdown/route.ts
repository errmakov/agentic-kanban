import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

type CountdownState = {
  status: 'idle' | 'running' | 'finished';
  endsAt: number | null;
};

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE_PATH = path.join(DATA_DIR, 'countdown.json');

const IDLE: CountdownState = { status: 'idle', endsAt: null };

async function readState(): Promise<CountdownState> {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    return JSON.parse(raw) as CountdownState;
  } catch {
    return IDLE;
  }
}

async function writeState(state: CountdownState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(state), 'utf8');
}

export async function GET() {
  const state = await readState();
  if (state.status === 'running' && state.endsAt !== null && state.endsAt <= Date.now()) {
    const finished: CountdownState = { status: 'finished', endsAt: state.endsAt };
    await writeState(finished);
    return NextResponse.json(finished);
  }
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  let body: { action?: string; durationSeconds?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.action === 'reset') {
    await writeState(IDLE);
    return NextResponse.json(IDLE);
  }

  if (body.action === 'start') {
    const seconds = body.durationSeconds;
    if (typeof seconds !== 'number' || !Number.isInteger(seconds) || seconds < 1 || seconds > 5999) {
      return NextResponse.json({ error: 'durationSeconds must be an integer between 1 and 5999' }, { status: 400 });
    }
    const running: CountdownState = { status: 'running', endsAt: Date.now() + seconds * 1000 };
    await writeState(running);
    return NextResponse.json(running);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
