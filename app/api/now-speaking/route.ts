import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'now-speaking.json');

export async function GET() {
  try {
    const raw = await readFile(dataFile, 'utf-8');
    const { session } = JSON.parse(raw);
    return NextResponse.json({ session: session ?? null });
  } catch {
    return NextResponse.json({ session: null });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const session = body?.session;

  if (typeof session !== 'string' || session.trim() === '') {
    return NextResponse.json({ error: 'session must be a non-empty string' }, { status: 400 });
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify({ session }), 'utf-8');

  return NextResponse.json({ session });
}
