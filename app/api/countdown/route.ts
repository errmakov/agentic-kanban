import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type CountdownState =
  | { state: 'idle' }
  | { state: 'running'; endsAt: number }
  | { state: 'finished' };

const MIN_DURATION_MS = 1_000; // 00:01
const MAX_DURATION_MS = 5_999_000; // 99:59

const dataDir = process.env.DATA_DIR ?? './data';
const file = path.join(dataDir, 'countdown.json');

async function read(): Promise<CountdownState> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as CountdownState;
  } catch {
    return { state: 'idle' };
  }
}

async function write(state: CountdownState): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(file, JSON.stringify(state));
}

export async function GET() {
  let state = await read();
  if (state.state === 'running' && state.endsAt <= Date.now()) {
    state = { state: 'finished' };
    await write(state);
  }
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = (await request.json()) as
    | { action: 'start'; durationMs: number }
    | { action: 'reset' };

  if (body.action === 'reset') {
    const state: CountdownState = { state: 'idle' };
    await write(state);
    return NextResponse.json(state);
  }

  if (body.action === 'start') {
    const { durationMs } = body;
    if (
      !Number.isInteger(durationMs) ||
      durationMs < MIN_DURATION_MS ||
      durationMs > MAX_DURATION_MS
    ) {
      return NextResponse.json({ error: 'invalid durationMs' }, { status: 400 });
    }
    const state: CountdownState = { state: 'running', endsAt: Date.now() + durationMs };
    await write(state);
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}
