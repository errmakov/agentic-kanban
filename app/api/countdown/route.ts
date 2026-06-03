import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

type Status = 'idle' | 'running' | 'finished';

interface CountdownState {
  status: Status;
  durationMs: number;
  startedAt: number;
}

const MAX_DURATION_MS = 99 * 60_000 + 59_000; // 99:59

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'countdown.json');

const IDLE: CountdownState = { status: 'idle', durationMs: 0, startedAt: 0 };

async function readState(): Promise<CountdownState> {
  try {
    const raw = await readFile(FILE, 'utf8');
    return JSON.parse(raw) as CountdownState;
  } catch {
    return { ...IDLE };
  }
}

async function writeState(state: CountdownState): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(state), 'utf8');
}

export async function GET() {
  const state = await readState();
  if (state.status === 'running' && Date.now() >= state.startedAt + state.durationMs) {
    state.status = 'finished';
    await writeState(state);
  }
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (body?.action === 'start') {
    const durationMs = Number(body.durationMs);
    if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs > MAX_DURATION_MS) {
      return NextResponse.json({ error: 'invalid durationMs' }, { status: 400 });
    }
    const state: CountdownState = { status: 'running', durationMs, startedAt: Date.now() };
    await writeState(state);
    return NextResponse.json(state);
  }

  if (body?.action === 'reset') {
    const state: CountdownState = { ...IDLE };
    await writeState(state);
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}
