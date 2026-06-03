import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

type CountdownState = {
  status: 'idle' | 'running' | 'done';
  durationSeconds: number;
  startedAt: number;
};

const IDLE: CountdownState = { status: 'idle', durationSeconds: 0, startedAt: 0 };

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = join(dataDir, 'countdown.json');

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
  if (
    state.status === 'running' &&
    Date.now() - state.startedAt >= state.durationSeconds * 1000
  ) {
    state.status = 'done';
    await writeState(state);
  }
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (body?.action === 'start') {
    const durationSeconds = body.durationSeconds;
    if (
      !Number.isInteger(durationSeconds) ||
      durationSeconds < 1 ||
      durationSeconds > 5999
    ) {
      return NextResponse.json({ error: 'invalid durationSeconds' }, { status: 400 });
    }
    const state: CountdownState = {
      status: 'running',
      durationSeconds,
      startedAt: Date.now(),
    };
    await writeState(state);
    return NextResponse.json(state);
  }

  if (body?.action === 'reset') {
    const state = { ...IDLE };
    await writeState(state);
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
