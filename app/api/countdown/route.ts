import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

interface CountdownState {
  endsAt: string | null;
  totalSeconds: number;
}

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'countdown.json');

const IDLE: CountdownState = { endsAt: null, totalSeconds: 0 };

async function read(): Promise<CountdownState> {
  try {
    return JSON.parse(await readFile(FILE, 'utf8')) as CountdownState;
  } catch {
    return IDLE;
  }
}

async function write(state: CountdownState): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(state), 'utf8');
}

export async function GET() {
  return NextResponse.json(await read());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { totalSeconds?: unknown } | null;
  const totalSeconds = body?.totalSeconds;
  if (typeof totalSeconds !== 'number' || !Number.isInteger(totalSeconds) || totalSeconds < 1 || totalSeconds > 5999) {
    return NextResponse.json({ error: 'totalSeconds must be an integer between 1 and 5999' }, { status: 400 });
  }
  const state: CountdownState = {
    endsAt: new Date(Date.now() + totalSeconds * 1000).toISOString(),
    totalSeconds,
  };
  await write(state);
  return NextResponse.json(state);
}

export async function DELETE() {
  await write(IDLE);
  return NextResponse.json(IDLE);
}
