import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Absolute end timestamp (Date.now() ms) for when the timer hits zero; null = idle.
// Using an absolute endpoint means the shared timer survives restarts/redeploys.
type TimerState = { endsAt: number | null };

const MAX_DURATION_MS = 5_999_000; // 99:59 cap

const dataDir = process.env.DATA_DIR ?? './data';
const filePath = path.join(dataDir, 'countdown-timer.json');

async function readState(): Promise<TimerState> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as TimerState;
    return { endsAt: typeof parsed.endsAt === 'number' ? parsed.endsAt : null };
  } catch {
    return { endsAt: null };
  }
}

async function writeState(state: TimerState): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(state), 'utf8');
}

export async function GET() {
  return NextResponse.json(await readState());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { durationMs?: unknown };
  const durationMs = body.durationMs;
  if (typeof durationMs !== 'number' || durationMs < 1 || durationMs > MAX_DURATION_MS) {
    return NextResponse.json({ error: 'invalid durationMs' }, { status: 400 });
  }
  const state: TimerState = { endsAt: Date.now() + durationMs };
  await writeState(state);
  return NextResponse.json(state);
}

export async function DELETE() {
  const state: TimerState = { endsAt: null };
  await writeState(state);
  return NextResponse.json(state);
}
