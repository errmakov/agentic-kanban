import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

type CountdownState = {
  status: 'idle' | 'running' | 'finished';
  endsAt: string | null;
  totalSeconds: number;
};

const IDLE: CountdownState = { status: 'idle', endsAt: null, totalSeconds: 0 };
const MAX_SECONDS = 5999; // 99:59

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'countdown.json');

async function readState(): Promise<CountdownState> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as CountdownState;
  } catch {
    return { ...IDLE };
  }
}

async function writeState(state: CountdownState): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(state), 'utf8');
}

export async function GET() {
  const state = await readState();
  if (state.status === 'running' && state.endsAt && new Date(state.endsAt) <= new Date()) {
    const finished: CountdownState = { ...state, status: 'finished' };
    await writeState(finished);
    return NextResponse.json(finished);
  }
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { action?: string; durationSeconds?: number }
    | null;

  if (body?.action === 'start') {
    const duration = body.durationSeconds;
    if (
      typeof duration !== 'number' ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > MAX_SECONDS
    ) {
      return NextResponse.json({ error: 'Invalid durationSeconds' }, { status: 400 });
    }
    const state: CountdownState = {
      status: 'running',
      endsAt: new Date(Date.now() + duration * 1000).toISOString(),
      totalSeconds: duration,
    };
    await writeState(state);
    return NextResponse.json(state);
  }

  if (body?.action === 'reset') {
    await writeState({ ...IDLE });
    return NextResponse.json({ ...IDLE });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
