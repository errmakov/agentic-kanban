import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const sessionFile = join(dataDir, 'session.json');

export async function GET() {
  try {
    const raw = await readFile(sessionFile, 'utf-8');
    const parsed = JSON.parse(raw);
    const name = typeof parsed.name === 'string' ? parsed.name : '';
    return NextResponse.json({ name });
  } catch {
    return NextResponse.json({ name: '' });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name must be a string' }, { status: 400 });
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(sessionFile, JSON.stringify({ name: body.name }), 'utf-8');
  return NextResponse.json({ name: body.name });
}
