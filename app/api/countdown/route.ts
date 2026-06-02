import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type CountdownState = {
  status: 'idle' | 'running' | 'done';
  endsAt: number | null;
  durationMs: number;
};

const IDLE: CountdownState = { status: 'idle', endsAt: null, durationMs: 0 };

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'countdown.json');

async function readState(): Promise<CountdownState> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as CountdownState;
  } catch {
    return IDLE;
  }
}

async function writeState(state: CountdownState): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state), 'utf8');
}

export async function GET() {
  const state = await readState();
  if (state.status === 'running' && state.endsAt !== null && state.endsAt <= Date.now()) {
    const done: CountdownState = { ...state, status: 'done' };
    await writeState(done);
    return NextResponse.json(done);
  }
  return NextResponse.json(state);
}

type StartBody = { action: 'start'; minutes: number; seconds: number };
type ResetBody = { action: 'reset' };
type Body = StartBody | ResetBody;

export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (body.action === 'reset') {
    await writeState(IDLE);
    return NextResponse.json(IDLE);
  }

  if (body.action === 'start') {
    const { minutes, seconds } = body;
    if (
      !Number.isInteger(minutes) ||
      !Number.isInteger(seconds) ||
      minutes < 0 ||
      minutes > 99 ||
      seconds < 0 ||
      seconds > 59 ||
      minutes * 60 + seconds <= 0
    ) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }
    const durationMs = (minutes * 60 + seconds) * 1000;
    const state: CountdownState = {
      status: 'running',
      endsAt: Date.now() + durationMs,
      durationMs,
    };
    await writeState(state);
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
