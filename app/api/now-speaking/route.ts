import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

const MAX_LEN = 120;

function dataDir(): string {
  return process.env.DATA_DIR ?? './data';
}

function dataFile(): string {
  return join(dataDir(), 'now-speaking.json');
}

async function readSession(): Promise<string> {
  try {
    const raw = await readFile(dataFile(), 'utf8');
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
  let body: { session?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.session !== 'string') {
    return NextResponse.json({ error: 'session must be a string' }, { status: 400 });
  }

  const session = body.session.trim().slice(0, MAX_LEN);

  await mkdir(dataDir(), { recursive: true });
  await writeFile(dataFile(), JSON.stringify({ session }), 'utf8');

  return NextResponse.json({ session });
}
