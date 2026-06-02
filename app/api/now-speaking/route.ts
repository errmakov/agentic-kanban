import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataDir = process.env.DATA_DIR ?? './data';
const dataFile = path.join(dataDir, 'now-speaking.json');

export async function GET() {
  try {
    const raw = await readFile(dataFile, 'utf-8');
    const { session } = JSON.parse(raw);
    return NextResponse.json({ session: typeof session === 'string' ? session : '' });
  } catch {
    return NextResponse.json({ session: '' });
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const session = typeof body?.session === 'string' ? body.session : '';
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify({ session }), 'utf-8');
  return NextResponse.json({ session });
}
