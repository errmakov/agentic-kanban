import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'countdown.json');

type CountdownData = { endsAt: string | null };
type Status = 'idle' | 'running' | 'done';

function deriveStatus(endsAt: string | null): Status {
  if (!endsAt) return 'idle';
  const remaining = new Date(endsAt).getTime() - Date.now();
  return remaining > 0 ? 'running' : 'done';
}

async function readData(): Promise<CountdownData> {
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw) as CountdownData;
  } catch {
    return { endsAt: null };
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json({ endsAt: data.endsAt, status: deriveStatus(data.endsAt) });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { action: string; seconds?: number };

  let endsAt: string | null;

  if (body.action === 'start') {
    const seconds = body.seconds;
    if (typeof seconds !== 'number' || !Number.isInteger(seconds) || seconds < 1 || seconds > 5999) {
      return NextResponse.json({ error: 'seconds must be an integer in [1, 5999]' }, { status: 400 });
    }
    endsAt = new Date(Date.now() + seconds * 1000).toISOString();
  } else if (body.action === 'reset') {
    endsAt = null;
  } else {
    return NextResponse.json({ error: 'action must be "start" or "reset"' }, { status: 400 });
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ endsAt }), 'utf-8');

  return NextResponse.json({ endsAt, status: deriveStatus(endsAt) });
}
