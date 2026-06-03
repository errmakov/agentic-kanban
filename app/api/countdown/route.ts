import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type CountdownState =
  | { status: 'idle' }
  | { status: 'running'; durationSeconds: number; startedAt: string };

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'countdown.json');

const IDLE: CountdownState = { status: 'idle' };

async function readState(): Promise<CountdownState> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw) as CountdownState;
  } catch {
    return IDLE;
  }
}

async function writeState(state: CountdownState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(state), 'utf8');
}

export async function GET() {
  return NextResponse.json(await readState());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (body?.action === 'reset') {
    await writeState(IDLE);
    return NextResponse.json(IDLE);
  }

  if (body?.action === 'start') {
    const durationSeconds = body.durationSeconds;
    if (
      typeof durationSeconds !== 'number' ||
      !Number.isInteger(durationSeconds) ||
      durationSeconds < 1 ||
      durationSeconds > 5999
    ) {
      return NextResponse.json({ error: 'invalid durationSeconds' }, { status: 400 });
    }
    const state: CountdownState = {
      status: 'running',
      durationSeconds,
      startedAt: new Date().toISOString(),
    };
    await writeState(state);
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
