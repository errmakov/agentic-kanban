import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'now-speaking.json');

async function readSession(): Promise<string> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw) as { session?: string };
    return parsed.session ?? '';
  } catch {
    return '';
  }
}

export async function GET() {
  return NextResponse.json({ session: await readSession() });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { session?: string };
  const session = (body.session ?? '').trim();
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify({ session }), 'utf8');
  return NextResponse.json({ session });
}
