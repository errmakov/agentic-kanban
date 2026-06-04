import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

interface TimerState {
  startedAt: number | null;
  durationMs: number | null;
}

const IDLE: TimerState = { startedAt: null, durationMs: null };

function dataFile() {
  return path.join(process.env.DATA_DIR ?? './data', 'countdown-timer.json');
}

async function readState(): Promise<TimerState> {
  try {
    const raw = await fs.readFile(dataFile(), 'utf8');
    return JSON.parse(raw) as TimerState;
  } catch {
    return IDLE;
  }
}

async function writeState(state: TimerState): Promise<void> {
  const file = dataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(state));
}

export async function GET() {
  const state = await readState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { durationMs: number };
  const state: TimerState = { startedAt: Date.now(), durationMs: body.durationMs };
  await writeState(state);
  return NextResponse.json(state);
}

export async function DELETE() {
  await writeState(IDLE);
  return NextResponse.json(IDLE);
}
