import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const dir = process.env.DATA_DIR ?? './data';
const file = path.join(dir, 'countdown.json');

const IDLE: State = { startedAt: null, durationSeconds: 0 };

type State = { startedAt: number | null; durationSeconds: number };

async function readState(): Promise<State> {
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw) as State;
  } catch {
    return IDLE;
  }
}

async function writeState(state: State): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(file, JSON.stringify(state));
}

export async function GET() {
  return NextResponse.json(await readState());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { durationSeconds?: unknown }
    | null;
  const durationSeconds = body?.durationSeconds;

  if (
    typeof durationSeconds !== 'number' ||
    !Number.isInteger(durationSeconds) ||
    durationSeconds < 1 ||
    durationSeconds > 5999
  ) {
    return NextResponse.json({ error: 'invalid durationSeconds' }, { status: 400 });
  }

  const state: State = { startedAt: Date.now(), durationSeconds };
  await writeState(state);
  return NextResponse.json(state);
}

export async function DELETE() {
  await writeState(IDLE);
  return NextResponse.json(IDLE);
}
