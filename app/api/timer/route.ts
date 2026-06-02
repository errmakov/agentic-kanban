import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type TimerStatus = 'idle' | 'running' | 'expired';

type TimerState = {
  endsAt: number | null;
  status: TimerStatus;
};

const IDLE: TimerState = { endsAt: null, status: 'idle' };

const dataDir = process.env.DATA_DIR ?? './data';
const timerFile = path.join(dataDir, 'timer.json');

async function readState(): Promise<TimerState> {
  try {
    const raw = await readFile(timerFile, 'utf8');
    return JSON.parse(raw) as TimerState;
  } catch {
    return IDLE;
  }
}

async function writeState(state: TimerState): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(timerFile, JSON.stringify(state), 'utf8');
}

export async function GET() {
  const state = await readState();
  if (state.status === 'running' && state.endsAt !== null && state.endsAt <= Date.now()) {
    const expired: TimerState = { endsAt: state.endsAt, status: 'expired' };
    await writeState(expired);
    return NextResponse.json(expired);
  }
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body?.action === 'start') {
    const durationMs = Number(body.durationMs);
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      return NextResponse.json({ error: 'invalid durationMs' }, { status: 400 });
    }
    const state: TimerState = { endsAt: Date.now() + durationMs, status: 'running' };
    await writeState(state);
    return NextResponse.json(state);
  }

  if (body?.action === 'reset') {
    await writeState(IDLE);
    return NextResponse.json(IDLE);
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}
