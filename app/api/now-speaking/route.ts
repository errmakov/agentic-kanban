import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const DATA_DIR = process.env.DATA_DIR ?? './data';
const FILE = path.join(DATA_DIR, 'now-speaking.json');

async function readSession(): Promise<string> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw) as { session?: unknown };
    return typeof parsed.session === 'string' ? parsed.session : '';
  } catch {
    return '';
  }
}

export async function GET() {
  return NextResponse.json({ session: await readSession() });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as { session?: unknown } | null;
  const session = typeof body?.session === 'string' ? body.session.trim() : '';
  if (!session) {
    return NextResponse.json({ error: 'session must be a non-empty string' }, { status: 400 });
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ session }), 'utf8');
  return NextResponse.json({ session });
}
